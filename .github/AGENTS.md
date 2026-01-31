# .github/ 配下 AGENTS.md（CI/CD）

このファイルは GitHub Actions の workflow 設計・保守性・落とし穴をまとめたものです。

## 0. 原則

- CI は **再現性（ローカル ≒ CI）** を最優先する。
- モノレポ前提で、初期は **`apps/web` の変更にだけ反応**する（`paths` フィルタ）。
- Git 由来の生成（`updatedAt`）があるため、checkout は **`fetch-depth: 0`** を基本とする。

## 1. Node / pnpm / キャッシュ

- Node は `mise.toml` を正として揃えるのが基本。
- Actions 上で `mise` を使わない場合でも、Node バージョンは固定する（CI と本番で差が出やすい）。
- pnpm は cache を有効化し、モノレポの場合は `apps/web/pnpm-lock.yaml` 等を `cache-dependency-path` に含める。

## 2. 推奨ジョブ構成（CI）

`apps/web` を `working-directory` にして、以下を順に実行する:

1) install（`pnpm install --frozen-lockfile`）
2) generate（`pnpm gen:meta`）
3) lint / typecheck
4) test（+ 任意で Functions テスト）
4.5) e2e（Playwright）
5) build

## 3. CD（Cloudflare Pages）に関する注意点

- `cloudflare/pages-action` は **deprecated / archived** のため、新規採用は避ける（過去資産の保守用途に限定）。
- 代替として `cloudflare/wrangler-action` を使い、`wrangler pages deploy` を実行する構成を推奨する。
- Cloudflare Pages のビルド環境（Build image）は Node のデフォルトが更新されることがある。
  - 依存が壊れやすい場合は Pages 側の設定で Node バージョンを明示固定する。

## 4. Secrets / 環境差分

- Secrets（`CLOUDFLARE_API_TOKEN` 等）は GitHub Secrets / Cloudflare 側に寄せ、リポジトリへ置かない。
- Preview と Production は KV を分ける（Preview アクセスで本番カウンターが汚れないようにする）。

## 5. 参照（一次情報）

- GitHub Actions:
  - https://docs.github.com/actions
- Cloudflare:
  - Wrangler GitHub Action: https://github.com/cloudflare/wrangler-action
  - Pages Action（deprecated）: https://github.com/cloudflare/pages-action
  - Pages build image（Node デフォルト等）: https://developers.cloudflare.com/pages/configuration/build-image/
