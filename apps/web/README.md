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

### Lint / Format

```sh
mise exec -- pnpm -C apps/web lint
mise exec -- pnpm -C apps/web format
mise exec -- pnpm -C apps/web format:check
```
