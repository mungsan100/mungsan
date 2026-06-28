import { defineConfig } from 'vitest/config';

// provider 어댑터 순수 단위 테스트. fetch는 각 테스트에서 stub하므로 DB·네트워크 의존이 없다.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
