import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

const tsEslintRecommendedCompat =
  tseslintPlugin.configs['eslint-recommended']?.overrides?.[0]?.rules ?? {};

export default [
  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },

  js.configs.recommended,

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    rules: {
      ...tsEslintRecommendedCompat,
      ...tseslintPlugin.configs.recommended.rules,
    },
  },

  ...astro.configs['flat/recommended'],

  prettier,
];

