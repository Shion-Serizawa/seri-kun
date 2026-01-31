# 自動テスト仕様（Astro / TypeScript 前提）

更新日: 2026-01-31

## 0. 目的

- ページ崩れ・ルーティング・記事一覧ロジック（タグ/年月）を機械的に担保する
- Cloudflare Pages Functions（アクセスカウンター API）が最低限の契約（JSON）を満たすことを担保する
- TS での変更を「型 + テスト」で安全に進める

## 1. テストレイヤー

### 1.1 静的チェック（必須）

- `pnpm lint`（ESLint）
- `pnpm typecheck`（`tsc --noEmit`）

運用:
- ローカルは `mise exec -- pnpm <command>` を基本にする（Node/pnpm の差分を減らす）

### 1.2 ユニットテスト（必須）

ツール:
- Vitest

対象（例）:
- Blog 一覧の並び替え（publishedAt desc）
- タグ絞り込み（`/blog?tag=...` のパース、未知タグ時の挙動）
- 年月グルーピング（`YYYY-MM` の生成）
- `updatedAt` 表示条件（`publishedAt` と比較して表示/非表示）
- `works` データの型整合性（最低限のスキーマチェック）

### 1.3 Cloudflare Functions テスト（推奨）

目的:
- `/api/visits` が `200` と `{ total: number }` を返す
- 設定不備（KV バインドなし）時に `500` を返す

方針（2026-01 時点の主流）:
- `@cloudflare/vitest-pool-workers` を使い、Workers ランタイム互換のテスト環境で実行する

注意:
- Cloudflare Pages Functions の入出力（`Request`/`Response`）は Web 標準なので、まずは関数本体を純粋関数に寄せる（KV 部分だけ薄いラッパーにする）とテストしやすい

補足（モノレポ）:
- 初期段階では `apps/web` のみを対象にテストを用意する
- 将来 Kotlin バックエンドが入ったら、`apps/backend` は別ジョブ/別コマンドでテストを回す（詳細は `work-docs/04-ci-cd.md`）

### 1.4 E2E（必須）

ツール:
- Playwright

対象:
- 目的は「壊れていない」ことの担保（スモークテスト）に寄せる
- 最低限:
  - `/` が 200 で表示される
  - `/works` が 200 で表示される
  - `/blog` が 200 で表示される
  - `/blog/[slug]` が 404 にならず、記事のタイトル等が表示される（テスト用コンテンツを 1 件用意）
- 追加（必要になったら）:
  - `/blog?tag=...` の URL 状態が反映される（タグ絞り込み）

実行方針:
- E2E は **本番に近い実行経路**を優先し、`wrangler pages dev`（静的アセット + Functions）上で行う
  - Cloudflare Pages Functions まで含めた統合ができるため（`astro dev` では代替にならない）
- 実行例（ローカル）:
  - `pnpm -C apps/web build`
  - `npx wrangler pages dev apps/web/dist`
  - `pnpm -C apps/web test:e2e`
- 実行要件:
  - E2E は CI でも回る必要があるため、Cloudflare アカウント情報や本番 KV など **Secrets を要求しない**。
  - KV が未バインドでも UI が壊れない（`Total Visits: —` 等にフォールバック）ことを前提にする。
- Flaky 対策:
  - 外部ネットワーク/時刻依存/ランダム性に依存しない
  - 1 テストあたりの責務を小さくし、最小の UI アサーションに留める

## 2. 合格基準（CI）

- `lint` / `typecheck` / `test` / `test:e2e` が全て成功
- `build` が成功（静的生成）
