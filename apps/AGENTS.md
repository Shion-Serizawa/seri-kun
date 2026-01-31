# apps/ 配下 AGENTS.md（Astro + Pages Functions）

このファイルは `apps/**` に適用されます。初期段階では `apps/web` のみを対象とします。

## 0. 基本方針（apps 全体）

- 変更は「アプリ単位」で閉じる（モノレポの将来拡張に備える）。
- コマンドは原則 `pnpm -C apps/web <script>` のように **対象アプリを明示**する。
- 生成物（例: `src/generated/*`）は方針を固定し、CI とローカルで差分が出ないようにする。

## 1. Astro（`apps/web`）の注意点（v5 前提）

### 1.1 “最新”に起因する詰まりどころ

- Astro v6 は beta 扱いの時期があり、ドキュメントが v5 と v6 で分岐している。
  - **参照しているドキュメントが v5 か v6 か**を必ず確認する（機能/設定が微妙に違う）。
- Node 要件/推奨が変わりやすい。
  - ローカルは `mise.toml` を正として揃える。
  - Cloudflare Pages のビルド環境は Node のデフォルトが変わることがあるため、必要なら Pages 側（環境変数や設定）でも Node を固定する。

### 1.2 ディレクトリ責務（`apps/web/src`）

- `src/pages/`: ルーティング（ページ）。ページ内ロジックは最小にする。
- `src/layouts/`: ページ骨格（Header/Main/Footer 等）。サイト横断の責務を集約。
- `src/components/`: 再利用 UI 部品（表示と最小の状態）。
- `src/lib/`: ドメインロジック（純粋関数中心、ユニットテスト対象）。
- `src/content/`: ブログ Markdown（Content Collections 管理）。
- `src/generated/`: 生成物（例: `updatedAt` マップ）。
- `src/data/`: `works` 等の静的データ（型付き）。

### 1.3 コーディング規約（Astro/TS）

- 基本方針:
  - サイト本体は SSG を維持し、動的処理は `/api/*`（Pages Functions）へ寄せる。
  - ページは「表示の組み立て」、ロジックは「純粋関数」に分離する。
- 命名:
  - `src/components/*.astro`: `PascalCase.astro`（例: `TotalVisits.astro`）
  - `src/layouts/*.astro`: `PascalCase.astro`（例: `BaseLayout.astro`）
  - `src/lib/*.ts`: `kebab-case.ts`（例: `updated-at.ts`, `blog.ts`）
- `.astro` の frontmatter は **TypeScript** で書く（副作用を避ける）。
- 重い処理（並び替え/グルーピング/パース）は `src/lib/*.ts` に逃がす。
- URL 状態（例: `/blog?tag=...`）は
  - **パース処理を `src/lib` に切り出し**、テスト可能にする。
  - 不正値/未知タグは壊れない（空状態・全件表示など）に寄せる。
- 日付:
  - `publishedAt`（意味論の公開日）と `updatedAt`（Git 由来）を混同しない。
  - 表示は `updatedAt !== publishedAt` のときのみ。
- 依存の境界:
  - `src/lib` は原則として副作用なし（IO・環境依存・日時の“現在時刻”依存を避ける）。
  - `src/pages` / `src/components` は `src/lib` を呼ぶだけに寄せる（テスト容易性/保守性）。

### 1.4 自動テスト戦略（Astro側）

- 必須（CI で常に回す）:
  - `lint` / `typecheck` / `test` / `test:e2e` / `build`
- ユニットテスト（Vitest）:
  - 記事一覧ロジック（並び替え/タグ/年月グルーピング）
  - `updatedAt` 表示条件
  - `works` データ形（最低限の型整合）
- E2E（Playwright）:
  - `wrangler pages dev` を前提にする（静的アセット + Functions の統合ができ、本番に近い）。

## 2. Cloudflare Pages Functions（`apps/web/functions`）の注意点

### 2.1 ルーティング/実行モデルの要点

- `functions/` 配下のファイル構造でルーティングされる（ファイルベース）。
- `onRequestGet` / `onRequestPost` など **HTTP メソッド別 export** を基本にする（読みやすさ/意図が明確）。
- `_middleware` は強力だが、**静的アセットも含めて横取り**し得るため、適用範囲を狭く・短く保つ。
- ランタイムは Workers（Web 標準）なので、Node.js 専用 API（`fs` 等）に依存しない。
  - 共有ロジック（`src/lib` 等）を Functions でも使い回す場合、Node 依存が混ざっていないか常に意識する。

### 2.2 `_routes.json`（重要）

- Pages Functions を導入すると、構成によっては **全リクエストが Workers（Functions）経由**になり得る。
- 静的配信を優先したい場合は `_routes.json` で **Functions を当てるパスを明示的に絞る**（コスト/性能/障害切り分けの観点で重要）。

### 2.3 Advanced mode の罠（重要）

- ビルド出力ディレクトリに `_worker.js`（または `_worker.js` + 付随ファイル）がある場合、Pages は **Advanced mode** として扱う。
  - Advanced mode では `functions/` ディレクトリが無視されるため、意図せず API が消える事故が起きやすい。
- Advanced mode では一部 API の挙動に制約がある（例: `passThroughOnException()` が使えない等）。

### 2.4 型付け/設計（Functions）

- `PagesFunction<Env>` で `context.env`（KV 等）を型付けする。
- `ExecutionContext`（`context.waitUntil()`）を活用し、レスポンス後に実行したい処理（ログ等）を安全に扱う。
- `wrangler.toml` を置く場合は `compatibility_date` を固定し、意図しないランタイム差分を減らす。
- IO を薄く:
  - KV 読み書き、`Request`/`Response` の取り回しは薄い層に閉じ込める。
  - インクリメント等のロジックは純粋関数化し、Vitest でテストしやすくする。
- KV は原子的インクリメントを保証しない（低トラフィック前提で許容。必要になれば Durable Object を検討）。

### 2.5 Functions のテスト（推奨）

- `@cloudflare/vitest-pool-workers` を用い、Workers ランタイム互換で契約テストを行う。
- 目標:
  - `/api/visits` が `200` と `{ total: number }` を返す
  - バインド不備時に `500` を返す（情報は漏らさない）

## 3. 参照（一次情報）

- Astro:
  - https://docs.astro.build/
  - https://v6.docs.astro.build/（v6 beta / upgrade。参照時は版に注意）
- Cloudflare Pages Functions:
  - https://developers.cloudflare.com/pages/functions/
  - Routing: https://developers.cloudflare.com/pages/functions/routing/
  - Middleware: https://developers.cloudflare.com/pages/functions/middleware/
  - API reference: https://developers.cloudflare.com/pages/functions/api-reference/
  - TypeScript（型生成など）: https://developers.cloudflare.com/pages/functions/typescript/
  - `_routes.json`: https://developers.cloudflare.com/pages/functions/routing/#create-a-_routesjson-file
  - Advanced mode: https://developers.cloudflare.com/pages/functions/advanced-mode/
- Workers testing（Vitest integration）:
  - https://developers.cloudflare.com/workers/testing/vitest-integration/
