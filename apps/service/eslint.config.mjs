import { defineConfig, globalIgnores } from 'eslint/config';
import { layeredImports, nextJsConfig } from '@mungsan/eslint';

const eslintConfig = defineConfig([
  ...nextJsConfig,
  {
    plugins: { custom: { rules: { 'layered-imports': layeredImports } } },
    rules: {
      'custom/layered-imports': [
        'warn',
        {
          root: 'apps/service',
          alias: [{ from: '*', to: '@/*' }],
          layers: [
            { name: 'adapter', modules: ['app/api/*'] },
            {
              name: 'app',
              modules: [
                'app/(app)',
                { pattern: 'app/(app)/*', exclude: '^(ui|commands|queries|domain)$' },
              ],
            },
            { name: 'lib', modules: ['lib/*'], allowSameLayer: true },
            { name: 'config', modules: ['config/*'], allowSameLayer: true },
            { name: 'utils', modules: ['utils/*'] },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
