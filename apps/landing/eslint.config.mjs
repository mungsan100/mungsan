import { defineConfig, globalIgnores } from 'eslint/config';
import { nextJsConfig } from '@mungsan/eslint';

// 랜딩페이지는 단일 페이지 정적 사이트라 레이어 규칙(custom/layered-imports)은 적용하지 않는다.
const eslintConfig = defineConfig([
  ...nextJsConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
