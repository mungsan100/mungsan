import { defineConfig } from 'vitest/config';

// order-key 등 순수 모듈 단위 테스트. DB·prisma 불필요(의존 없는 파일만 대상).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
