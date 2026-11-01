# apps/web（Astro / SSG）

ポートフォリオサイト本体です。SSG を基本方針とし、動的処理は将来 `functions/`（Cloudflare Pages Functions）へ寄せます。

## コマンド

リポジトリルートから実行してください（`pnpm -C apps/web ...` で対象アプリを明示します）。

## CSS の置き場（運用方針）

- `src/styles/global.css`: 変数/リセット/共通ユーティリティなど「全ページ共通」
- `*.astro` の見た目は、基本は `*.module.css`（CSS Modules）に切り出してスコープを保つ
  - 例: `src/layouts/BaseLayout.module.css`, `src/pages/index.module.css`

### 開発サーバー

```sh
mise exec -- pnpm -C apps/web dev
```

`http://localhost:4321/` を開きます。

### 型チェック（公式推奨）

```sh
mise exec -- pnpm -C apps/web typecheck
```

`astro build` は型チェックを行わないため、CI では `astro check` を別途実行します（このリポジトリでは `typecheck`）。

### ビルド（静的出力）

```sh
mise exec -- pnpm -C apps/web build
```

`apps/web/dist/` に出力されます。

### ビルド成果物のプレビュー

```sh
mise exec -- pnpm -C apps/web preview
```

### Check / Lint / Format（Vite+）

```sh
mise exec -- pnpm -C apps/web check         # vp check（format + lint + type-aware）
mise exec -- pnpm -C apps/web lint          # vp lint（Oxlint）
mise exec -- pnpm -C apps/web format        # vp fmt（Oxfmt）
mise exec -- pnpm -C apps/web format:check
```

設定は `vite.config.ts` の `lint` / `fmt` / `test` ブロックにまとめています。
`.astro` は Oxfmt 同梱の prettier-plugin-astro で整形します（`@astrojs/compiler-rs` が必要）。lint（Oxlint）は frontmatter / `<script>` 部分のみが対象です。
