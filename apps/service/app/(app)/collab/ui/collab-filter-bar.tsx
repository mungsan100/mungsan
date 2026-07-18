'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { SkillOption } from '../queries/collab-skills.query';

// 필터 밴드 라벨 — 쿼리의 BUDGET_BANDS/DURATION_BANDS 키와 일치해야 한다(값 검증은 쿼리 쪽).
const BUDGET_OPTIONS = [
  { value: 'u10000', label: '1천만 미만' },
  { value: 'b10000', label: '1천만~5천만' },
  { value: 'b50000', label: '5천만~1억' },
  { value: 'o100000', label: '1억 이상' },
];

const DURATION_OPTIONS = [
  { value: 'u1', label: '1개월 이하' },
  { value: 'b1', label: '1~3개월' },
  { value: 'b3', label: '3~6개월' },
  { value: 'o6', label: '6개월 이상' },
];

interface CollabFilterBarProps {
  skills: SkillOption[];
  regions: string[];
}

// 상세 필터 바(PRD FR-CLBMK-2) — 역량/지역/예산/기간 셀렉트 + 모집중/마감임박/추천순 토글 칩.
// URL 쿼리 파라미터로 표현해 검색·업종 필터와 자유 조합(교집합)된다.
export const CollabFilterBar = ({ skills, regions }: CollabFilterBarProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/collab?${params.toString()}`, { scroll: false });
  }

  function toggleParam(key: string, onValue: string) {
    setParam(key, searchParams.get(key) === onValue ? null : onValue);
  }

  const selectClass =
    'border-ink-200 text-ink-600 h-9 min-w-0 shrink-0 rounded-full border bg-white px-3 text-[13px] font-semibold focus:outline-none';
  const chipClass = (active: boolean) =>
    `h-9 shrink-0 rounded-full px-3 text-[13px] font-semibold ${
      active ? 'bg-ink-900 text-white' : 'border-ink-200 text-ink-600 border bg-white'
    }`;

  return (
    <div className="scrollbar-none -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
      <select
        aria-label="필요 역량"
        value={searchParams.get('skill') ?? ''}
        onChange={(e) => setParam('skill', e.target.value || null)}
        className={selectClass}
      >
        <option value="">역량 전체</option>
        {skills.map((skill) => (
          <option key={skill.id} value={skill.id}>
            {skill.name}
          </option>
        ))}
      </select>

      <select
        aria-label="지역"
        value={searchParams.get('region') ?? ''}
        onChange={(e) => setParam('region', e.target.value || null)}
        className={selectClass}
      >
        <option value="">지역 전체</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>

      <select
        aria-label="예산"
        value={searchParams.get('budget') ?? ''}
        onChange={(e) => setParam('budget', e.target.value || null)}
        className={selectClass}
      >
        <option value="">예산 전체</option>
        {BUDGET_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="기간"
        value={searchParams.get('duration') ?? ''}
        onChange={(e) => setParam('duration', e.target.value || null)}
        className={selectClass}
      >
        <option value="">기간 전체</option>
        {DURATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => toggleParam('status', 'open')}
        className={chipClass(searchParams.get('status') === 'open')}
      >
        모집중
      </button>
      <button
        type="button"
        onClick={() => toggleParam('deadline', 'soon')}
        className={chipClass(searchParams.get('deadline') === 'soon')}
      >
        마감임박
      </button>
      <button
        type="button"
        onClick={() => toggleParam('sort', 'recommended')}
        className={chipClass(searchParams.get('sort') === 'recommended')}
      >
        추천순
      </button>
    </div>
  );
};
