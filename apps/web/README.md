# apps/web（Astro / SSG）

ポートフォリオサイト本体です。SSG を基本方針とし、動的処理は将来 `functions/`（Cloudflare Pages Functions）へ寄せます。

## コマンド

リポジトリルートから実行してください（`pnpm -C apps/web ...` で対象アプリを明示します）。

### 開発サーバー

```sh
mise exec -- pnpm -C apps/web dev
```

`http://localhost:4321/` を開きます。

### ビルド（静的出力）

```sh
mise exec -- pnpm -C apps/web build
```

`apps/web/dist/` に出力されます。

### ビルド成果物のプレビュー

```sh
mise exec -- pnpm -C apps/web preview
```
