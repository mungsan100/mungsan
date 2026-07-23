'use client';

import * as Sentry from '@sentry/nextjs';
import { useCallback, useEffect, useRef, useState } from 'react';

// Cloudflare Turnstile 위젯(2026-07-20 봇 방지) — 외부 스크립트를 지연 로드해 렌더하고,
// 발급 토큰을 콜백으로 올린다. 사이트 키 미설정(로컬 dev)이면 아무것도 렌더하지 않는다
// (서버 검증도 같이 생략되는 구성이라 로컬 가입 흐름을 막지 않는다).
//
// 2026-07-22 하드닝: 실기기에서 위젯이 완료되지 않아 가입이 영구 대기하는 사고 발생.
// 실패가 화면에 전혀 드러나지 않아 원인 추적이 불가능했다 — 아래 3중 감지를 추가한다.
//   ① render 의 error-callback: Cloudflare 에러 코드(110200=호스트네임 미허용 등)를 그대로 수집
//   ② 스크립트 onerror: api.js 자체 로드 실패(네트워크·차단) 감지
//   ③ 로드 타임아웃(15초): 스크립트는 붙었지만 render/토큰까지 못 가는 나머지 전부
// 실패 시 사용자에겐 재시도 UI를 보여주고, 에러 코드는 Sentry 로 원격 보고해
// 다음 발생 시 대시보드에서 원인 코드를 바로 읽을 수 있게 한다(onStatus 로 폼에도 알림).
//
// 2026-07-22 원인 확정: 로더 URL 에 `v0/` 세그먼트가 빠져 있었다. `turnstile/api.js` 는
// Cloudflare 에 존재하지 않는 경로(404)라 <script> 가 항상 onerror → SCRIPT_LOAD_FAILED.
// 즉 위젯은 도입 이래 어떤 브라우저에서도 로드된 적이 없었다. 공식 로더는 v0 경로다:
// https://developers.cloudflare.com/turnstile/get-started/ (검증: 구경로 404, v0 200 + 로드 실측)
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
const LOAD_TIMEOUT_MS = 15_000;

export type TurnstileStatus = 'loading' | 'ready' | 'error';

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          // true 반환 시 Cloudflare 기본 에러 표시를 억제한다 — 우리 재시도 UI로 대체.
          'error-callback'?: (errorCode: string) => boolean | void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget = ({
  onToken,
  onStatus,
}: {
  onToken: (token: string | null) => void;
  onStatus?: (status: TurnstileStatus) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failure, setFailure] = useState<string | null>(null); // 에러 코드(표시·보고용)
  const [retryTick, setRetryTick] = useState(0);

  // onToken/onStatus 는 부모의 안정 참조 전제(기존 컨벤션) — effect 의존성에서 제외한다.
  const report = useCallback(
    (code: string) => {
      setFailure(code);
      onToken(null);
      onStatus?.('error');
      // DSN 미설정이면 no-op — 배포에서만 원격 보고된다. 보고 실패가 UI를 깨면 안 되므로 감싼다.
      try {
        Sentry.captureMessage(`turnstile-widget-failure: ${code}`, 'warning');
      } catch {
        /* no-op */
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    const el = containerRef.current;
    let widgetId: string | null = null;
    let cancelled = false;
    let settled = false; // 렌더 성공(또는 실패 확정) 여부 — 타임아웃 판정용

    const fail = (code: string) => {
      if (cancelled || settled) return;
      settled = true;
      report(code);
    };

    function renderWidget() {
      if (cancelled || settled || !window.turnstile) return;
      try {
        widgetId = window.turnstile.render(el, {
          sitekey: SITE_KEY as string,
          theme: 'light',
          callback: (token: string) => {
            settled = true;
            onToken(token);
            onStatus?.('ready');
          },
          'expired-callback': () => onToken(null), // 토큰 만료(5분) 시 재검증 필요 상태로
          'error-callback': (errorCode: string) => {
            fail(errorCode || 'UNKNOWN_RENDER_ERROR');
            return true; // Cloudflare 기본 에러 UI 억제 — 아래 재시도 UI가 대신한다
          },
        });
        // render 자체는 성공 — 이후 callback/error-callback 이 결말을 정한다.
        // (Managed 모드는 보통 수 초 내 자동 발급; 15초 넘게 무소식이면 아래 타임아웃이 잡는다)
      } catch {
        fail('RENDER_THREW');
      }
    }

    onStatus?.('loading');
    if (window.turnstile) renderWidget();
    else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      // 재시도인데 스크립트가 붙어 있고도 turnstile 이 없다 = 이전 로드가 실패한 태그.
      // 그대로 두면 load/error 가 다시 오지 않아 재시도가 항상 타임아웃한다 — 떼고 새로 요청한다.
      if (script && retryTick > 0) {
        script.remove();
        script = null;
      }
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderWidget);
      script.addEventListener('error', () => fail('SCRIPT_LOAD_FAILED'));
      // 이미 실패한 script 태그에 뒤늦게 붙는 경우(load/error 둘 다 안 옴)는 타임아웃이 커버.
    }

    const timeout = setTimeout(() => fail('TIMEOUT_15S'), LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
    // retryTick: 재시도 버튼이 위젯을 처음부터 다시 시도하게 한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryTick]);

  if (!SITE_KEY) return null;

  if (failure)
    return (
      <div className="border-ink-200 bg-canvas rounded-xl border px-4 py-3 text-center">
        <p className="text-ink-700 text-[13px]">
          보안 확인 모듈을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
        <p className="text-ink-400 mt-0.5 text-[11px]">오류 코드: {failure}</p>
        <button
          type="button"
          onClick={() => {
            setFailure(null);
            onStatus?.('loading');
            setRetryTick((t) => t + 1);
          }}
          className="border-ink-300 text-ink-700 mt-2 inline-flex h-8 items-center justify-center rounded-lg border bg-white px-3 text-[13px] font-semibold"
        >
          다시 시도
        </button>
      </div>
    );

  return <div ref={containerRef} className="flex justify-center" />;
};
