import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import importPlugin from 'eslint-plugin-import';
import eslintConfigPrettier from 'eslint-config-prettier';

// 세 앱 공통 Next flat-config preset. layered-imports 는 앱별로 별도 합성한다.
export const nextJsConfig = [
  ...nextVitals,
  ...nextTs,
  {
    plugins: { import: importPlugin },
    rules: {
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          pathGroups: [{ pattern: '@/**', group: 'internal', position: 'after' }],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports', disallowTypeAnnotations: true },
      ],
      // process.env 직접 접근 전면 금지 — 모든 env는 검증된 단일 소스를 통해서만 읽는다.
      // 경계 파일(config/server.ts·config/client.ts)은 인라인 eslint-disable 주석으로 예외 처리한다.
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: 'process.env 직접 접근 금지 — 검증된 단일 소스 config/server.ts(또는 config/client.ts)를 통해 사용하세요.',
        },
      ],
    },
  },
  eslintConfigPrettier,
];
