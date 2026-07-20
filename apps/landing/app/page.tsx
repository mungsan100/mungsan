import HeroBackdrop from '@/components/HeroBackdrop';
import ScreenshotFrame from '@/components/ScreenshotFrame';
import {
  IconBookmark,
  IconBulb,
  IconCalendar,
  IconChat,
  IconCheck,
  IconChecklist,
  IconClipboard,
  IconCoin,
  IconData,
  IconGauge,
  IconHistory,
  IconLock,
  IconMask,
  IconNetwork,
  IconProfile,
  IconProgress,
  IconRadar,
  IconReceipt,
  IconRisk,
  IconScale,
  IconScore,
  IconSearch,
  IconSend,
  IconShield,
  IconTicket,
  IconUsers,
  IconX,
} from '@/components/icons';
import { SCREENSHOTS, SIGNUP_URL } from '@/lib/landing-config';

/* ==========================================================================
 * 공통 레이아웃 조각
 * ========================================================================== */

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`px-6 py-24 sm:py-32 ${className}`}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

function Eyebrow({ children, tone = 'light' }: { children: React.ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <span
      className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${
        tone === 'dark' ? 'bg-white/15 text-white' : 'bg-brand-soft text-brand-sub01'
      }`}
    >
      {children}
    </span>
  );
}

function Heading({
  children,
  tone = 'light',
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <h2
      className={`text-3xl leading-[1.35] font-bold tracking-tight sm:text-4xl ${
        tone === 'dark' ? 'text-white' : 'text-ink-900'
      }`}
    >
      {children}
    </h2>
  );
}

function Sub({
  children,
  tone = 'light',
}: {
  children: React.ReactNode;
  tone?: 'light' | 'dark';
}) {
  return (
    <p
      className={`mt-5 text-lg leading-relaxed ${
        tone === 'dark' ? 'text-white/70' : 'text-ink-500'
      }`}
    >
      {children}
    </p>
  );
}

/* ==========================================================================
 * 섹션별 콘텐츠 데이터
 * ========================================================================== */

const PROBLEMS = [
  { Icon: IconScale, title: '규모 부족', desc: '혼자서는 큰 프로젝트에 들어가기 어렵습니다.' },
  { Icon: IconShield, title: '신뢰 부족', desc: '함께할 기업이 검증되어 있는지 알기 어렵습니다.' },
  {
    Icon: IconNetwork,
    title: '네트워크 부족',
    desc: '좋은 파트너를 늘 아는 사람 안에서만 돌고 돕니다.',
  },
  { Icon: IconRisk, title: '협업 리스크', desc: '잘못된 파트너십은 프로젝트 전체를 무너뜨립니다.' },
  {
    Icon: IconData,
    title: '데이터 부족',
    desc: '어떤 기업과 함께해야 성공 가능성이 높은지 판단하기 어렵습니다.',
  },
  {
    Icon: IconChecklist,
    title: '실행 관리 부족',
    desc: '협업을 시작해도 진행 상황과 정산을 체계적으로 관리하기 어렵습니다.',
  },
];

const COMPARE_OUTSOURCE = [
  '일을 맡길 사람을 찾음',
  '발주자와 수행자 관계',
  '가격과 포트폴리오 중심',
  '단건 거래 중심',
  '거래 후 관계 종료',
];

const COMPARE_MUNGSAN = [
  '함께 수행할 파트너사를 제안',
  '공동 수행 파트너 관계',
  '역량 보완성과 신뢰 중심',
  '대형 프로젝트 공동 진입',
  '협업 이력과 신뢰 데이터 축적',
];

const HOW_STEPS = [
  '기업 데이터 분석',
  '부족한 역량 탐지',
  '최적 파트너사 조합',
  '공동 수행 구조 설계',
  '대형 프로젝트 참여 가능',
];

const LOUNGE_POINTS = [
  { Icon: IconLock, title: 'C-Level 전용 공간', desc: '검증된 대표와 임원 중심의 폐쇄형 라운지' },
  { Icon: IconMask, title: '익명 기반 고민 공유', desc: '민감한 비즈니스 고민도 안전하게 공유' },
  { Icon: IconChat, title: '협업 니즈 발견', desc: '게시글과 반응을 통해 협업 가능성을 탐색' },
];

const MARKET_POINTS = [
  { Icon: IconSearch, title: '파트너사 탐색', desc: '업종, 기술, 협업 분야별 기업 탐색' },
  { Icon: IconGauge, title: '적합도 확인', desc: '역량 보완성과 신뢰 지표 확인' },
  { Icon: IconSend, title: '공식 제안', desc: '관심 기업에게 협업 제안 발송' },
  { Icon: IconBookmark, title: '후보 저장', desc: '공동 수행 후보 기업을 저장하고 비교' },
];

const SHERPA_POINTS = [
  { Icon: IconUsers, title: '역할 관리' },
  { Icon: IconCalendar, title: '일정 관리' },
  { Icon: IconProgress, title: '진행률 확인' },
  { Icon: IconReceipt, title: '증빙·정산 관리' },
];

const DATA_CARDS = [
  { Icon: IconProfile, title: '기업 프로파일링' },
  { Icon: IconClipboard, title: '프로젝트 요건 분석' },
  { Icon: IconHistory, title: '유사 사례 검토' },
  { Icon: IconScore, title: '매칭 스코어링' },
  { Icon: IconBulb, title: '설명 가능한 제안' },
  // 요청받은 설명 문구: "협업 실패 가능성이 높은 조합을 사전에 걸러냅니다."
  // 이 섹션의 카드는 6개 모두 제목만 노출하는 형식이라, 한 장에만 설명을 넣으면
  // 균형이 깨져 제목만 표시한다. 6장 전부에 설명을 넣기로 하면 이 값을 살리면 된다.
  { Icon: IconRadar, title: '리스크 신호 탐지' },
];

const TRUST_STEPS = [
  '기업 등록',
  '사업자 인증',
  '대표/임원 인증',
  '수행 이력 등록',
  '전문 분야 태깅',
  '협업 평가 축적',
];

const METRICS = [
  { value: '5회', label: '스타트업 포럼 운영' },
  { value: '116명', label: '예비·초기 창업자 대상 테스트' },
  { value: '28%', label: '행사 직후 실제 협업 논의 전환' },
  { value: '87개', label: '초기 기업 DB 확보' },
];

const BETA_BENEFITS = [
  { Icon: IconTicket, title: '파트너 추천 베타 우선 초대' },
  { Icon: IconSearch, title: '초기 협업 후보 검토' },
  { Icon: IconClipboard, title: '비즈니스 브리핑 베타 이용' },
  { Icon: IconCoin, title: '뭉산 크레딧 우선 제공' },
];

const FAQS = [
  {
    q: '이용 비용이 있나요?',
    a: '베타 기간에는 무료로 이용할 수 있습니다. 정식 요금제는 베타 이후 공개될 예정입니다.',
  },
  { q: '가입에 무엇이 필요한가요?', a: '사업자등록증과 대표 또는 임원 확인이 필요합니다.' },
  {
    q: '익명 라운지에서 제 신원이 드러나지 않나요?',
    a: '가명으로 활동하며, 기업 인증 여부만 표시됩니다.',
  },
  {
    q: '외주 매칭 플랫폼과 무엇이 다른가요?',
    a: '발주-수주 관계가 아닌, 대등하게 프로젝트를 함께 수행하는 파트너 관계를 지향합니다.',
  },
  { q: '어떤 기업이 가입할 수 있나요?', a: '사업자등록을 마친 기업의 대표와 임원이 가입할 수 있습니다.' },
];

/* ==========================================================================
 * 페이지
 * ========================================================================== */

export default function Page() {
  return (
    <main>
      {/* ── 1. 히어로 ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-soft via-white to-white px-6 pt-32 pb-28 sm:pt-40 sm:pb-36">
        <HeroBackdrop />
        {/* 배경 위에 텍스트가 오도록 스택 순서를 올린다 */}
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <Eyebrow>초기 스타트업을 위한 협업 파트너 플랫폼</Eyebrow>
          <h1 className="mt-8 text-4xl leading-[1.3] font-bold tracking-tight text-ink-900 sm:text-5xl sm:leading-[1.28]">
            더 큰 협업을 위한 기회
            <br />
            뭉산에서 함께할 파트너사를 찾으세요.
          </h1>
          {/* ⚠️ 링크 임시(#) — 실제 주소는 lib/landing-config.ts 의 SIGNUP_URL 한 줄만 바꾸면 됩니다 */}
          <a
            href={SIGNUP_URL}
            className="mt-12 inline-flex items-center justify-center rounded-2xl bg-brand-sub01 px-9 py-4 text-lg font-semibold text-white shadow-[0_10px_30px_-8px_rgb(21_128_61/0.5)] transition hover:bg-brand-sub02"
          >
            시작하기
          </a>
        </div>
      </section>

      {/* ── 2. 문제 제기 ─────────────────────────────────────────────── */}
      <Section>
        <div className="max-w-2xl">
          {/* 쉼표를 의미 단위 경계로 삼아 강제 줄바꿈. '순간'만 홀로 떨어지는 것을 막는다. */}
          <Heading>
            기회는 왔는데,
            <br />
            우리 회사 이름만으로는 부족했던 순간
          </Heading>
        </div>
        <blockquote className="mt-10 border-l-4 border-brand pl-6 text-xl leading-relaxed font-medium text-ink-700 sm:text-2xl">
          &ldquo;제안서 마지막 장에서 항상 막혔습니다. 실적, 인력, 레퍼런스.&rdquo;
        </blockquote>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-ink-200 bg-white p-8 transition hover:shadow-[0_12px_36px_-16px_rgb(15_23_42/0.2)]"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-sub01">
                <Icon />
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. 공동 수행 구조 ─────────────────────────────────────────── */}
      <Section className="bg-ink-50">
        <div className="mx-auto max-w-2xl text-center">
          <Heading>혼자서는 어려운 프로젝트, 여럿이면 가능합니다</Heading>
        </div>
        <div className="mt-16 flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="rounded-2xl border-2 border-brand bg-white px-7 py-5 text-center font-bold text-brand-sub01 shadow-sm">
              우리 회사
            </div>
            {['파트너사 A', '파트너사 B', '파트너사 C'].map((name) => (
              <div key={name} className="flex items-center gap-4">
                <span className="text-2xl font-light text-ink-300">+</span>
                <div className="rounded-2xl border border-ink-200 bg-white px-7 py-5 text-center font-semibold text-ink-700 shadow-sm">
                  {name}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-light text-ink-300">=</span>
            <div className="rounded-2xl bg-brand-sub01 px-8 py-5 text-center font-bold text-white shadow-[0_10px_30px_-10px_rgb(21_128_61/0.6)]">
              공동 수행 구조
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. 비교표 ────────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Heading>갑과 을이 아니라, 옆에 서는 파트너</Heading>
          <Sub>외주는 일을 맡기는 관계입니다. 뭉산은 함께 완성하는 관계입니다.</Sub>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* 외주 매칭 */}
          <div className="rounded-3xl border border-ink-200 bg-ink-50 p-8 sm:p-10">
            <h3 className="text-xl font-bold text-ink-500">외주 매칭</h3>
            <ul className="mt-8 space-y-5">
              {COMPARE_OUTSOURCE.map((item) => (
                <li key={item} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-200 text-ink-500">
                    <IconX className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-ink-500">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* 뭉산 */}
          <div className="rounded-3xl border-2 border-brand bg-white p-8 shadow-[0_16px_48px_-24px_rgb(21_128_61/0.4)] sm:p-10">
            <h3 className="text-xl font-bold text-brand-sub01">뭉산</h3>
            <ul className="mt-8 space-y-5">
              {COMPARE_MUNGSAN.map((item) => (
                <li key={item} className="flex items-start gap-3.5">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-sub01">
                    <IconCheck className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-medium text-ink-800">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ── 5. 작동 원리 ─────────────────────────────────────────────── */}
      <Section className="bg-ink-50">
        <div className="mx-auto max-w-2xl text-center">
          {/* 쉼표 기준 2줄 고정 */}
          <Heading>
            뭉산은 부족한 부분을 찾아,
            <br />
            채워줄 파트너를 제안합니다
          </Heading>
        </div>
        <ol className="mx-auto mt-16 flex max-w-lg flex-col items-stretch gap-3">
          {HOW_STEPS.map((step, i) => (
            <li key={step} className="flex flex-col items-center gap-3">
              <div
                // 번호 원 + 텍스트를 한 덩어리로 묶어 카드 안에서 가로·세로 모두 가운데 정렬
                className={`flex w-full items-center justify-center gap-4 rounded-2xl px-7 py-5 text-center ${
                  i === HOW_STEPS.length - 1
                    ? 'bg-brand-sub01 text-white shadow-[0_10px_30px_-10px_rgb(21_128_61/0.6)]'
                    : 'border border-ink-200 bg-white text-ink-800'
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    i === HOW_STEPS.length - 1
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-soft text-brand-sub01'
                  }`}
                >
                  {i + 1}
                </span>
                <span className="font-semibold">{step}</span>
              </div>
              {i < HOW_STEPS.length - 1 && (
                <span className="text-xl leading-none text-ink-300" aria-hidden>
                  ↓
                </span>
              )}
            </li>
          ))}
        </ol>
        {/* 이미지 자리 — 파트너 추천 또는 협업 마켓플레이스 화면 */}
        <div className="mt-16">
          <ScreenshotFrame shot={SCREENSHOTS.howItWorks} />
        </div>
      </Section>

      {/* ── 6. 임원 전용 라운지 ───────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Heading>대표의 고민은, 회사 안 누구에게도 말할 수 없습니다</Heading>
          <Sub>
            직원에게도, 투자자에게도 꺼내지 못한 이야기. 같은 무게를 아는 대표들과 익명으로
            나누세요.
          </Sub>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {LOUNGE_POINTS.map(({ Icon, title, desc }) => (
            // 가운데 정렬된 제목 아래에 놓이므로 카드 내용도 가운데로 맞춘다(8번 섹션과 동일 규칙).
            <div key={title} className="flex flex-col items-center text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-sub01">
                <Icon />
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
        {/* 이미지 자리 — 임원 전용 익명 라운지 앱 화면 (크게 배치) */}
        <div className="mt-16">
          <ScreenshotFrame shot={SCREENSHOTS.lounge} />
        </div>
      </Section>

      {/* ── 7. 협업 마켓플레이스 ──────────────────────────────────────── */}
      <Section className="bg-ink-50">
        <div className="mx-auto max-w-2xl text-center">
          <Heading>필요한 파트너를 찾고, 먼저 손 내미는 곳</Heading>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {MARKET_POINTS.map(({ Icon, title, desc }) => (
            // 위와 동일 — 아이콘·제목·설명을 세로 가운데 축에 맞춘다.
            <div key={title} className="flex flex-col items-center text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-sub01 shadow-sm">
                <Icon />
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink-900">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
        {/* 이미지 자리 — 협업 마켓플레이스 앱 화면 (크게 배치) */}
        <div className="mt-16">
          <ScreenshotFrame shot={SCREENSHOTS.marketplace} />
        </div>
      </Section>

      {/* ── 8. My 셰르파 ─────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Beta Preview — 출시 예정 기능</Eyebrow>
          <div className="mt-8">
            <Heading>만남 이후의 협업까지, 뭉산이 함께 오릅니다</Heading>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {SHERPA_POINTS.map(({ Icon, title }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-sub01">
                <Icon />
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink-900">{title}</h3>
            </div>
          ))}
        </div>
        {/* 이미지 자리 — 공유 대시보드 / 공동 수행 관리 화면 */}
        <div className="mt-16">
          <ScreenshotFrame shot={SCREENSHOTS.sherpa} badge="Beta Preview" />
        </div>
      </Section>

      {/* ── 9. 데이터 기반 분석 (짙은 녹색 배경) ───────────────────────── */}
      <Section className="bg-brand-deep">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow tone="dark">데이터 기반 분석</Eyebrow>
          <div className="mt-8">
            <Heading tone="dark">감이 아니라 데이터로, 협업 가능성을 설계합니다</Heading>
          </div>
          <Sub tone="dark">
            뭉산은 단순 키워드 매칭이 아니라, 기업의 수행 이력과 프로젝트 요건을 비교해 성공
            가능성이 높은 파트너사 조합을 제안합니다.
          </Sub>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATA_CARDS.map(({ Icon, title }) => (
            <div
              key={title}
              // 다크그린 배경 위에서 카드 경계가 보이도록 배경·테두리를 올리고,
              // 아이콘 칩은 카드보다 한 단계 더 밝은 녹색으로 계층을 만든다.
              className="flex items-center justify-center gap-4 rounded-2xl border border-white/25 bg-white/[0.08] px-6 py-6 text-center"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/45 text-white ring-1 ring-white/20">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-semibold text-white">{title}</h3>
            </div>
          ))}
        </div>
        {/* 이미지 자리 — 데이터 기반 파트너 추천 구조 그래픽 */}
        <div className="mt-16">
          <ScreenshotFrame shot={SCREENSHOTS.dataGraphic} tone="dark" />
        </div>
      </Section>

      {/* ── 10. 신뢰 프로세스 ─────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Heading>아무나 들어올 수 없어서, 누구든 믿을 수 있습니다</Heading>
          <Sub>
            누구나 제안할 수 있는 플랫폼은 결국 스팸이 됩니다. 뭉산은 검증된 기업과 대표 중심의
            네트워크를 만듭니다.
          </Sub>
        </div>
        <ol className="mt-16 flex flex-wrap items-center justify-center gap-x-3 gap-y-4">
          {TRUST_STEPS.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <div className="rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700">
                <span className="mr-2 text-brand-sub01">{i + 1}</span>
                {step}
              </div>
              {i < TRUST_STEPS.length - 1 && (
                <span className="text-ink-300" aria-hidden>
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* ── 11. 검증 수치 ────────────────────────────────────────────── */}
      <Section className="bg-ink-50">
        <div className="mx-auto max-w-2xl text-center">
          <Heading>현장에서 먼저 확인한 협업 수요</Heading>
        </div>
        <dl className="mt-16 grid grid-cols-2 gap-10 lg:grid-cols-4">
          {METRICS.map(({ value, label }) => (
            // 시각적으로는 숫자가 위에 오지만, 의미상 dt(항목)→dd(값) 순서를 지키고
            // flex-col-reverse로 화면 순서만 뒤집는다.
            <div key={label} className="flex flex-col-reverse text-center">
              <dt className="mt-4 leading-relaxed text-ink-500">{label}</dt>
              <dd className="text-4xl font-bold tracking-tight text-brand-sub01 sm:text-5xl">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      {/* ── 12. 베타 혜택 ────────────────────────────────────────────── */}
      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <Heading>초기 신청 기업에게 먼저 열립니다</Heading>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {BETA_BENEFITS.map(({ Icon, title }) => (
            <div
              key={title}
              className="flex items-center justify-center gap-5 rounded-3xl border border-ink-200 bg-white p-8 text-center"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-sub01">
                <Icon />
              </span>
              <h3 className="text-lg font-bold text-ink-900">{title}</h3>
            </div>
          ))}
        </div>
        <p className="mt-10 rounded-2xl bg-ink-50 px-7 py-6 text-sm leading-relaxed text-ink-500">
          뭉산 크레딧은 정식 출시 후 파트너 추천, 기업 분석, 협업 제안글 노출 등에 사용할 수 있는
          앱 내 이용 단위입니다.
        </p>
      </Section>

      {/* ── 13. FAQ ─────────────────────────────────────────────────── */}
      <Section className="bg-ink-50">
        <div className="mx-auto max-w-2xl text-center">
          <Heading>자주 묻는 질문</Heading>
        </div>
        <div className="mx-auto mt-16 max-w-3xl space-y-4">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-ink-200 bg-white px-7 py-6 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-ink-900">
                {q}
                <span
                  className="shrink-0 text-xl leading-none text-ink-400 transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-ink-500">{a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── 14. 최종 CTA ─────────────────────────────────────────────── */}
      <section className="bg-brand-sub01 px-6 py-28 sm:py-36">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2 className="text-3xl leading-[1.35] font-bold tracking-tight text-white sm:text-4xl">
            혼자 넘기 어려웠던 문턱, 이제 함께 넘으세요
          </h2>
          {/* ⚠️ 링크 임시(#) — 실제 주소는 lib/landing-config.ts 의 SIGNUP_URL 한 줄만 바꾸면 됩니다 */}
          <a
            href={SIGNUP_URL}
            className="mt-12 inline-flex items-center justify-center rounded-2xl bg-white px-9 py-4 text-lg font-semibold text-brand-sub01 shadow-lg transition hover:bg-brand-soft"
          >
            지금 시작하기
          </a>
        </div>
      </section>

      {/* ── 15. 푸터 ────────────────────────────────────────────────── */}
      <footer className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-3 text-sm leading-relaxed text-ink-500">
          <p className="font-semibold text-ink-800">
            뭉산 · 초기 스타트업의 생존과 확장을 돕는 B2B 협업 인프라
          </p>
          <p>
            문의:{' '}
            <a href="mailto:Mungsan100@gmail.com" className="text-brand-sub01 hover:underline">
              Mungsan100@gmail.com
            </a>
          </p>
          <p className="text-ink-400">© 2026 뭉산. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
