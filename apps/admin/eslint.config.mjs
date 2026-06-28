import { defineConfig, globalIgnores } from 'eslint/config';
import { nextJsConfig } from '@mungsan/eslint';

export default defineConfig([
  ...nextJsConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
