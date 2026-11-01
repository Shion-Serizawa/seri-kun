// Vite+（vp）用の設定。Astro 本体のビルド設定は astro.config.mjs 側に置く。
// ここは lint（Oxlint）/ fmt（Oxfmt）/ test（Vitest）だけを担当する。
import { defineConfig } from 'vite-plus';

const ignorePatterns = [
  'dist/**',
  'node_modules/**',
  '.astro/**',
  '.tmp/**',
  '.wrangler/**',
  'src/generated/**',
  'test-results/**',
  'playwright-report/**',
  'pnpm-lock.yaml',
];

// ブログ本文は整形しない。updatedAt は記事ファイルの最終コミットから決まるため、
// ツール都合の整形コミットで「更新日」が変わってしまう。
const fmtIgnorePatterns = [...ignorePatterns, 'src/content/**'];

export default defineConfig({
  fmt: {
    ignorePatterns: fmtIgnorePatterns,
    printWidth: 100,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
    // .astro は Oxfmt 同梱の prettier-plugin-astro で整形する（@astrojs/compiler-rs が必要）。
    // compressHTML は astro.config.mjs の compressHTML: true と揃える。
    astro: { compressHTML: 'html' },
  },
  lint: {
    ignorePatterns,
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        // Node 側の生成スクリプトは最小限の shim を triple-slash で参照する
        files: ['scripts/**/*.ts'],
        rules: { 'typescript/triple-slash-reference': 'off' },
      },
      {
        // vi.fn() のモックを expect に渡すのは意図どおり
        files: ['**/*.test.ts'],
        rules: { 'typescript/unbound-method': 'off' },
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'functions/**/*.test.ts'],
  },
});
