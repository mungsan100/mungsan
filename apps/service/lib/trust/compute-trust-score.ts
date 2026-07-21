// 신뢰지수 계산 공식은 service·admin 공유 단일 진실원인 @mungsan/trust 로 이관됐다.
// 이 파일은 기존 소비처(trust-score.query 등)의 '@/lib/trust/compute-trust-score' 임포트를
// 깨지 않기 위한 재수출 shim이다 — 공식을 바꿀 땐 packages/trust/src/index.ts 만 수정한다.
export * from '@mungsan/trust';
