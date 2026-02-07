import js from '@eslint/js';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';

const tsEslintRecommendedCompat =
  tseslintPlugin.configs['eslint-recommended']?.overrides?.[0]?.rules ?? {};

export default [
  {
    ignores: ['dist/', 'node_modules/', '.astro/', '.tmp/', 'src/generated/'],
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

  // Node-side generation scripts (typed with minimal shims)
  {
    files: ['scripts/**/*.{ts,mjs}'],
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    files: ['scripts/node-shim.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  ...astro.configs['flat/recommended'],

  prettier,
];

