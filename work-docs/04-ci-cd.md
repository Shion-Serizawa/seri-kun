# CI/CD 仕様（GitHub Actions + Cloudflare Pages）

更新日: 2026-01-31

## 0. 前提

- Node.js: Astro v5 の要件を満たす **Node 20 系**を標準にする（将来 v6 採用時は Node 22.12+ に引き上げ）
- パッケージマネージャ: pnpm（想定）
- デプロイ先: Cloudflare Pages（静的配信）+ Pages Functions（API）
- ツールチェーン管理: `mise`（`mise.toml` で Node/pnpm を固定）
- リポジトリは将来 Kotlin バックエンドも同居するモノレポを想定
  - 初期段階では `apps/web` のみ CI/CD 対象（バックエンドは「将来」）

## 1. CI（PR/Push で常に回す）

### 1.1 トリガー

- `pull_request`: main 向け
- `push`: main / develop（運用に合わせる）

運用メモ（モノレポ）:
- まずは `apps/web/**` の変更時のみ CI を回す（`paths` フィルタ）
- Kotlin バックエンドを追加したら `apps/backend/**` 用に別ジョブを追加する

### 1.2 ジョブ（順序）

1) Checkout
- `fetch-depth: 0`（`updatedAt` 生成で Git 履歴が必要）

2) ツールチェーンセットアップ（Node/pnpm）
  - `mise` を使う（推奨）
    - `mise trust --yes`（必要な場合）
    - `mise install`
  - もしくは `actions/setup-node` 等で Node/pnpm を入れてもよい（ただしローカルと乖離しやすい）

3) 生成
- `pnpm gen:meta`（`updatedAt` マップ生成）
  - 実行場所は `apps/web`（例: GitHub Actions の `working-directory: apps/web` または `pnpm -C apps/web ...`）

4) 静的チェック
- `pnpm lint`
- `pnpm typecheck`

5) テスト
- `pnpm test`
- （任意）`pnpm test:cf`（Functions テスト）
- `pnpm test:e2e`（E2E / Playwright）

6) ビルド
- `pnpm build`

合格条件:
- 全ステップ成功

補足（E2E の前提）:
- `test:e2e` は CI でも回すため、Cloudflare の本番向け Secrets を要求しない（ローカルと同様に動く）。
- Pages Functions の設定不備（例: KV 未バインド）は UI を壊さず、フォールバック表示で成立させる。

## 2. CD（Cloudflare Pages へのデプロイ）

### 2.1 方針

- main への push で本番デプロイ
- PR は Preview デプロイ（Cloudflare Pages の仕組みを活用）

### 2.2 デプロイ方法

候補 A（推奨）:
- `cloudflare/wrangler-action` を使用し、GitHub Actions から `wrangler pages deploy` を実行してデプロイ

候補 B:
- Cloudflare Pages の GitHub 連携に任せ、GitHub Actions は CI のみにする  
  - ただし `updatedAt` 生成やテストの成否とデプロイの整合性を取りにくいので、初期は A を推奨

注意:
- `cloudflare/pages-action` は **deprecated / archived** のため、新規採用しない（過去資産の保守目的に限定する）。

### 2.3 必要な Secrets（GitHub）

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- （Action/設定により）`CLOUDFLARE_PAGES_PROJECT_NAME`

補足:
- これらは GitHub Secrets で管理する（ローカルの `mise` に入れない）

### 2.4 Cloudflare 側の設定

- KV Namespace を作成
- Pages Functions へ Binding（例: `VISITS_KV`）を設定
- 環境別（Preview/Production）の変数差分が必要なら、Cloudflare Pages 側で分ける

## 3. ブランチ運用（最低限）

- main: 保護（CI 必須、レビュー必須）
- develop（任意）: 統合用

## 4. デプロイ環境（Cloudflare Pages）

### 4.1 環境の種類

- Local（開発）
  - UI のみ: `astro dev`
  - Functions も含める: `wrangler pages dev`（本番挙動に近い）
- Preview（検証）
  - PR ごとの Preview デプロイ（Cloudflare Pages の仕組み）
  - URL は Cloudflare Pages が払い出す preview ドメイン
- Production（本番）
  - main への push（または merge）でデプロイ

### 4.2 環境変数 / バインディングの方針

- `PUBLIC_CF_ANALYTICS_TOKEN`
  - Preview/Production で同一でも良い（見たくない場合は Preview では未設定にしても良い）
- KV（例: `VISITS_KV`）
  - Preview と Production は **分ける**（Preview のアクセスで本番カウンターが汚れないようにする）
  - 例: `VISITS_KV_PREVIEW`, `VISITS_KV_PRODUCTION`（Cloudflare 側で環境別に binding を差し替える）
