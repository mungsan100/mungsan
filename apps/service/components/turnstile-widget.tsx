'use client';

import { useEffect, useRef } from 'react';

// Cloudflare Turnstile 위젯(2026-07-20 봇 방지) — 외부 스크립트를 지연 로드해 렌더하고,
// 발급 토큰을 콜백으로 올린다. 사이트 키 미설정(로컬 dev)이면 아무것도 렌더하지 않는다
// (서버 검증도 같이 생략되는 구성이라 로컬 가입 흐름을 막지 않는다).
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/api.js?render=explicit';
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export const TurnstileWidget = ({ onToken }: { onToken: (token: string | null) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    const el = containerRef.current;
    let widgetId: string | null = null;
    let cancelled = false;

    function renderWidget() {
      if (cancelled || !window.turnstile) return;
      widgetId = window.turnstile.render(el, {
        sitekey: SITE_KEY as string,
        theme: 'light',
        callback: onToken,
        'expired-callback': () => onToken(null), // 토큰 만료(5분) 시 재검증 필요 상태로
      });
    }

    if (window.turnstile) renderWidget();
    else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = SCRIPT_SRC;
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderWidget);
    }

    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
    // onToken 은 부모의 setState 안정 참조 전제 — 위젯을 재렌더하지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} className="flex justify-center" />;
};
