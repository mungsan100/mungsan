import { defineConfig } from 'vitest/config';

// emailLayout 등 순수 모듈 단위 테스트. Resend 실호출 없음(레이아웃 문자열만 검증).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
