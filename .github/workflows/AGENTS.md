# .github/workflows/ 配下 AGENTS.md（workflow 実装規約）

## 0. 目的

- workflow の変更が「ビルド/テスト/デプロイの意味」を壊さないようにする。
- 将来 `apps/backend` が増えても破綻しない構成にする。

## 1. 実装ルール

- `paths` フィルタを付け、初期は `apps/web/**` 変更時だけ CI を回す。
- `actions/checkout` は `fetch-depth: 0`（`updatedAt` 生成のため）。
- `working-directory: apps/web` を基本にし、モノレポでの誤実行を避ける。
- 依存の再現性のため `pnpm install --frozen-lockfile` を基本にする。
- CI で生成するステップ（`pnpm gen:meta` 等）は **必ず `build` の前**に置く。
- E2E（Playwright）は必須。サーバ起動は `wrangler pages dev` を優先し、静的アセット + Functions を同経路で検証する。

## 2. デプロイ（採用する場合）

- `cloudflare/pages-action` は deprecated のため避ける。
- `cloudflare/wrangler-action` + `wrangler pages deploy` を使用する。
