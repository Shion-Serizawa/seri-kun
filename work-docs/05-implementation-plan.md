# 実装計画（コミット計画レベル / Astro + TypeScript）

更新日: 2026-01-31

目的: `work-docs/01`〜`04` の仕様を、実装とレビューがしやすい **小さなコミット**に分割して進める。

前提:
- Astro v5（安定版）
- Node 20 系 / pnpm
- サイト本体は SSG、動的処理は Cloudflare Pages Functions
- 将来 Kotlin バックエンドも同居するモノレポを想定（ただし **初期段階ではバックエンドは作らない**）
- 初期実装の作業ディレクトリは `apps/web`（Cloudflare Pages の Root directory もここを想定）

## 補足: `src/generated` について（重要）

- `src/generated` は **人が手で編集しない、自動生成されるソース置き場**（アプリが参照する「生成入力」）。
- `dist/` 等の **ビルド成果物（最終出力）とは別物**。
- 初期は **生成物をコミットしない（`.gitignore`）** を推奨（差分ノイズ削減・再現性は CI で担保）。
- `src/generated` の読み取りは参照点を 1 箇所に固定するため、**`src/lib/updated-at.ts` のみ**が行う（他は必ずラッパ経由）。
- 生成手順は `scripts/generate-content-metadata.ts` を `prebuild` / CI に組み込み、ビルド前に必ず生成する。

## 0. マイルストーン

M1: Astro で静的にページが揃う  
M2: ブログが Content Collections で管理できる  
M3: `updatedAt` 自動生成が CI/CD を含めて動く  
M4: `/api/visits`（KV）でフッター表示が動く  
M5: テスト/CI が最低限回る  

## 1. コミット計画

進捗:
- [x] Commit 0: `chore: add mise toolchain (node/pnpm)`
- [x] Commit 1: `chore: init astro project (ts, pnpm)`
- [x] Commit 2: `chore: add lint/format/typecheck scripts`
- [x] Commit 3: `feat: add base layout + global styles`
- [x] Commit 4: `feat: add works data model and /works page`
- [x] Commit 5: `feat: scaffold blog content collection`
- [x] Commit 6: `feat: implement /blog list with tag + monthly grouping`
- [x] Commit 7: `feat: implement /blog/[slug] page (md render + meta)`
- [x] Commit 8: `feat: add analytics hook point`
- [x] Commit 9: `feat: generate updatedAt map from git`
- [x] Commit 10: `feat: wire updatedAt into blog page`

### Commit 0: `chore: add mise toolchain (node/pnpm)`

- `mise.toml` を追加して Node/pnpm を固定する
- `mise` が untrusted を警告する場合に備え、初回の `mise trust` を手順に含める
- ローカルのシークレットファイル（`.env`, `.dev.vars`）は Git 管理しない
- ローカルの環境変数は `mise.local.toml`（Git 管理しない）に寄せる

主な変更（例）:
- `mise.toml`
- `mise.local.toml.example`
- `.gitignore`

参照:
- `work-docs/02-non-page-spec.md`（ローカル env を `mise` に寄せる方針）
- [mise]
- [mise trust]
- [mise env]

### Commit 1: `chore: init astro project (ts, pnpm)`

- `apps/web` に Astro プロジェクトの雛形を作成（テンプレ minimal を想定）
- TypeScript を有効化（strict ベース）
- 生成物のディレクトリ構成を作る

主な変更（例）:
- `apps/web/package.json`, `apps/web/pnpm-lock.yaml`
- `apps/web/astro.config.mjs`
- `apps/web/tsconfig.json`
- `apps/web/src/pages/index.astro`（初期）

参照:
- `work-docs/01-page-spec.md`（ページ要件）
- [Astro Install]
- [Astro TypeScript]
- [Astro Project Structure]

### Commit 2: `chore: add lint/format/typecheck scripts`

- ESLint + Prettier（Astro 対応）を導入
- npm scripts を確定

主な変更（例）:
- `.eslintrc.*`, `.prettierrc*`
- `package.json` scripts: `lint`, `format`, `typecheck`

参照:
- [ESLint]
- [Prettier]

### Commit 3: `feat: add base layout + global styles`

- `BaseLayout`（Header/Main/Footer）を追加
- 全ページ共通の最低限 CSS（変数/タイポ/余白）を追加
- Footer に `Total Visits: —`（まだ API 未接続）を表示
- Footer に解析の小さい注記を表示（文言は仕様に従う）

主な変更（例）:
- `apps/web/src/layouts/BaseLayout.astro`
- `apps/web/src/styles/global.css`

参照:
- `work-docs/01-page-spec.md`（共通レイアウト/フッター仕様）
- `work-docs/02-non-page-spec.md`（Analytics の差し込み方針）
- [Astro Layouts]
- [Cloudflare Web Analytics]

### Commit 4: `feat: add works data model and /works page`

- `src/data/works.ts` を型付きで追加
- `/works` を 1ページ完結で実装

主な変更（例）:
- `apps/web/src/data/works.ts`
- `apps/web/src/pages/works.astro`
- `apps/web/src/components/works/WorkCard.astro`

参照:
- `work-docs/01-page-spec.md`（/works の要件）
- [Astro Routing]

### Commit 5: `feat: scaffold blog content collection`

- ブログ Markdown の置き場を確定
- `src/content.config.ts` でスキーマ定義（frontmatter を型付け）
  - `slug` は frontmatter ではなく `entry.id`（相対パス）を使う方針
- サンプル記事 1 本を追加（draft=false）

主な変更（例）:
- `apps/web/src/content/blog/2026-01-31-example.md`
- `apps/web/src/content.config.ts`

参照:
- `work-docs/01-page-spec.md`（ブログ frontmatter 要件）
- [Astro Content Collections]

### Commit 6: `feat: implement /blog list with tag + monthly grouping`

- `/blog` を実装
  - 新しい順
  - `?tag=` で絞り込み
  - `YYYY-MM` グルーピング表示

主な変更（例）:
- `apps/web/src/pages/blog/index.astro`
- `apps/web/src/lib/blog.ts`（グルーピング/フィルタ等の純粋関数）

参照:
- `work-docs/01-page-spec.md`（/blog の要件）
- [Astro Content Collections]

### Commit 7: `feat: implement /blog/[slug] page (md render + meta)`

- 記事詳細ページを実装
- `publishedAt` の表示
- `updatedAt` は一旦未実装 or 仮実装（後続で差し替え）

主な変更（例）:
- `apps/web/src/pages/blog/[slug].astro`

参照:
- `work-docs/01-page-spec.md`（/blog/[slug] の要件）
- [Astro Content Collections]

### Commit 8: `feat: add analytics hook point`

- Layout に Cloudflare Web Analytics の差し込みポイントだけ作る（ID 等は後で設定）

主な変更（例）:
- `apps/web/src/layouts/BaseLayout.astro`

参照:
- `work-docs/02-non-page-spec.md`（Analytics 方針 / `PUBLIC_CF_ANALYTICS_TOKEN`）
- [Cloudflare Web Analytics]

### Commit 9: `feat: generate updatedAt map from git`

- `scripts/generate-content-metadata.ts` を追加（TS）
- `src/generated/*` を生成する仕組みを追加
- `src/generated` の参照点は `src/lib/updated-at.ts` に固定する（他から直接読まない）
- `pnpm gen:meta` を追加し、`pnpm build` の前提にする

主な変更（例）:
- `apps/web/scripts/generate-content-metadata.ts`
- `apps/web/scripts/run-ts.mjs`（TypeScript スクリプト実行用の最小ランナー）
- `apps/web/src/lib/updated-at.ts`（生成物参照の単一窓口）
- `apps/web/src/generated/blog-updated-at.json`（生成物。初期はコミットしない）
- `apps/web/package.json` scripts 更新

方針選択（どちらか）:
- A: 生成物はコミットしない（CI で毎回生成）→ `.gitignore` に追加
- B: 生成物をコミットする（ローカルでの表示が常に安定）  

初期は A 推奨（差分ノイズが減る）。

参照:
- `work-docs/02-non-page-spec.md`（`updatedAt` 自動生成の要件）
- [Git Log]

### Commit 10: `feat: wire updatedAt into blog page`

- `src/lib/updated-at.ts` 経由で `src/generated` を参照し `updatedAt` を表示
- `updatedAt !== publishedAt` のときのみ表示

主な変更（例）:
- `apps/web/src/pages/blog/[slug].astro`
- `apps/web/src/lib/updated-at.ts`

参照:
- `work-docs/01-page-spec.md`（表示条件）
- `work-docs/02-non-page-spec.md`（生成物の参照方針）

### Commit 11: `feat: add cloudflare pages function for visits counter`

- `functions/api/visits.ts` を追加（TypeScript）
- KV Binding（例: `VISITS_KV`）を前提に read/modify/write

主な変更（例）:
- `apps/web/functions/api/visits.ts`
- `wrangler.toml`（必要なら）

参照:
- `work-docs/02-non-page-spec.md`（カウンター API 仕様）
- [Cloudflare Pages]
- [Cloudflare Pages Functions]
- [Cloudflare KV]
- [Wrangler]

### Commit 12: `feat: show total visits in footer`

- フッターで `POST /api/visits` を 1 回叩く
- 失敗時は `—` 表示にフォールバック

主な変更（例）:
- `apps/web/src/components/TotalVisits.astro`（または small script component）
- `apps/web/src/layouts/BaseLayout.astro`

参照:
- `work-docs/01-page-spec.md`（Footer 表示）
- `work-docs/02-non-page-spec.md`（フロント呼び出し仕様）

### Commit 13: `test: add vitest and unit tests for blog logic`

- Vitest 導入
- `/blog` のグルーピング/絞り込みをテスト

主な変更（例）:
- `apps/web/vitest.config.ts`
- `apps/web/src/lib/blog.test.ts`

参照:
- `work-docs/03-testing.md`（テスト方針）
- [Vitest]

### Commit 14: `test: add tests for visits function`

- `@cloudflare/vitest-pool-workers` などで `/api/visits` の契約テスト

主な変更（例）:
- `apps/web/functions/api/visits.test.ts`

参照:
- `work-docs/03-testing.md`（Functions テスト方針）
- [vitest-pool-workers]

### Commit 15: `test: add playwright e2e smoke tests`

- Playwright を導入し、E2E を「スモークテスト」として常時回す
- `wrangler pages dev` 上で実行する（静的アセット + Functions の統合ができ、本番に近い）
- E2E は Secrets を要求しない（KV 未バインドでも UI が壊れない設計に寄せる）

主な変更（例）:
- `apps/web/playwright.config.ts`
- `apps/web/e2e/*.spec.ts`
- `apps/web/package.json` scripts: `test:e2e`

参照:
- `work-docs/03-testing.md`（E2E 方針）
- [Playwright]
- [Wrangler]

### Commit 16: `ci: add github actions workflow (lint/typecheck/test/e2e/build)`

- CI を追加（`fetch-depth: 0` を含む）
- `pnpm gen:meta` を CI に組み込み
- `pnpm test:e2e` を必須にする

主な変更（例）:
- `.github/workflows/ci.yml`

参照:
- `work-docs/04-ci-cd.md`（CI 要件）
- [GitHub Actions]
- [GitHub Secrets]

### Commit 17: `ci: add deploy workflow to cloudflare pages`（任意）

- `cloudflare/wrangler-action` + `wrangler pages deploy` によるデプロイ
- Secrets 前提（`CLOUDFLARE_API_TOKEN` 等）

主な変更（例）:
- `.github/workflows/deploy.yml`

参照:
- `work-docs/04-ci-cd.md`（CD 要件）
- [Wrangler Action]

## 2. 実装時の注意点（詰まりどころ）

- `updatedAt` 生成は Git 履歴が必要 → CI で `fetch-depth: 0` が必須
- Pages Functions とローカル dev の整合 → E2E は `wrangler pages dev` を使う（本番に近い）
- KV のインクリメント誤差 → 想定トラフィックが増えたら Durable Object を検討

## 3. 参照ドキュメント

- 内部仕様（このリポジトリ）
  - `work-docs/01-page-spec.md`（ページ仕様）
  - `work-docs/02-non-page-spec.md`（ページ以外の仕様）
  - `work-docs/03-testing.md`（自動テスト）
  - `work-docs/04-ci-cd.md`（CI/CD）
- 外部ドキュメント（公式）
  - Astro: インストール/構成/Content Collections
  - Cloudflare: Pages / Pages Functions / KV / Web Analytics / Wrangler
  - GitHub Actions: workflow / secrets
  - mise: ツールチェーン / env / trust

[mise]: https://mise.jdx.dev/
[mise trust]: https://mise.jdx.dev/cli/trust.html
[mise env]: https://mise.jdx.dev/cli/env.html

[Astro Install]: https://docs.astro.build/en/install-and-setup/
[Astro Project Structure]: https://docs.astro.build/en/basics/project-structure/
[Astro Routing]: https://docs.astro.build/en/basics/astro-pages/
[Astro Layouts]: https://docs.astro.build/en/basics/layouts/
[Astro TypeScript]: https://docs.astro.build/en/guides/typescript/
[Astro Content Collections]: https://docs.astro.build/en/guides/content-collections/

[Cloudflare Pages]: https://developers.cloudflare.com/pages/
[Cloudflare Pages Functions]: https://developers.cloudflare.com/pages/functions/
[Cloudflare KV]: https://developers.cloudflare.com/kv/
[Cloudflare Web Analytics]: https://developers.cloudflare.com/analytics/web-analytics/
[Wrangler Action]: https://github.com/cloudflare/wrangler-action
[Wrangler]: https://developers.cloudflare.com/workers/wrangler/

[GitHub Actions]: https://docs.github.com/actions
[GitHub Secrets]: https://docs.github.com/actions/security-guides/using-secrets-in-github-actions

[Vitest]: https://vitest.dev/
[vitest-pool-workers]: https://developers.cloudflare.com/workers/testing/vitest-integration/
[Playwright]: https://playwright.dev/
[Git Log]: https://git-scm.com/docs/git-log
