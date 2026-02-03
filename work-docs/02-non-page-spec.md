# ページ以外に必要な実装仕様（Astro / TypeScript 前提）

更新日: 2026-01-31

このドキュメントは、ページ（UI）以外に必要な実装を仕様化します。

## 0. ディレクトリ設計（提案）

このリポジトリは将来 Kotlin バックエンドも同居する **モノレポ**前提とし、アプリ単位を `apps/` 配下に分離する。
（※ 現時点の実装スコープは `apps/web` のみ。`apps/backend` は「将来入る」ことを明記するだけで、初期段階では作らない。）

```
apps/
  web/               Astro（SSG）+ Cloudflare Pages Functions
    src/
      components/    UI部品
      layouts/       共通レイアウト
      pages/         ルーティング（静的）
      content/       ブログMarkdown
      generated/     生成物（更新日時マップ等）
      data/          works 等の静的データ（TS）
    functions/       Cloudflare Pages Functions（API）
    scripts/         生成スクリプト（TS）
  backend/            Kotlin API（将来）
contracts/           API契約（例: OpenAPI）
work-docs/           設計ドキュメント（作業用）
docs/               確定したドキュメント（必要になったら）
```

方針:
- Astro は `output: 'static'` を維持する（サイト本体は静的配信）
- 動的処理は Cloudflare Pages Functions に寄せる

### 0.1 `apps/web/src` の内部戦略（レイヤー維持 + ドメインで束ねる）

前提:
- Astro の都合（ルーティング/レイアウト/Content Collections）に沿って、`src/pages`, `src/layouts`, `src/content`, `src/generated` などの **レイヤーは崩さない**
- 一方で、UI 部品やロジックは “変更理由” の単位（ドメイン）でまとまっていた方が保守しやすい
  - このプロジェクトでは特に `blog` が増えやすい想定のため、`blog` 関連は初期から寄せる

推奨:
- `src/components/` はドメイン別サブディレクトリを基本にする
  - `src/components/blog/*`: Blog 専用 UI
  - `src/components/works/*`: Works 専用 UI
  - `src/components/shared/*`: 複数ページ/複数ドメインで使う共通 UI
- `src/lib/` も同様にドメイン別サブディレクトリにする（純粋関数中心、ユニットテスト対象）
  - `src/lib/blog/*`, `src/lib/works/*`, `src/lib/shared/*` など
- `src/pages/` は “表示の組み立て” に寄せる（重い並び替え/グルーピング/パースは `src/lib` に逃がす）
- `src/generated/` は直参照を避け、`src/lib` に 1 箇所ラッパを置いて集約する（参照点を固定する）

## 1. アクセスカウンター API

### 1.1 目的

- サイト全体の累計 PV（Total Visits）を保持し、全ページのフッターに表示する
- ページ単位の集計はしない

### 1.2 データストア

- Cloudflare KV を使用（Free枠内を想定）
- キー: `site:total_visits`

注意:
- KV は強整合・原子的インクリメントを保証しないため、同時アクセスが増えると誤差が出る可能性がある  
  - 想定トラフィックが小さい間は許容
  - 厳密性が必要になったら Durable Object へ移行できるようにコードを分離する

### 1.3 エンドポイント仕様

- Path: `/api/visits`
- Method:
  - `POST`: カウントをインクリメントして値を返す（ページ表示時に 1 回）
  - `GET`: 値を返す（将来の用途。初期は未実装でも可）

レスポンス（JSON）:
```json
{ "total": 12345 }
```

ステータス:
- 正常: `200`
- KV 未バインド等の設定不備: `500`（メッセージは最小限）

ヘッダー:
- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store`（値が即時変化するため）

セキュリティ（最低限）:
- CORS は同一オリジン想定（`Access-Control-Allow-Origin` を広げない）
- ボット対策は最初は Cloudflare 側（Bot/Rate limiting）に寄せ、アプリ側では過剰実装しない

### 1.4 フロント側呼び出し仕様

- 全ページで 1 回だけ `POST /api/visits` を叩く
- フッターに `Total Visits: XXXXX` を表示する
- 失敗時は UI を壊さず、カウンター部分を `—` 表示にする（ログは開発時のみ）

補足（将来の Kotlin バックエンド導入を見据えたルール）:
- まずは **同一オリジン**（Cloudflare Pages Functions）で `/api/*` を提供する
- 将来 `/api` を Kotlin 側に移す場合でも、フロントは原則「相対パス `/api/...`」で呼び出せる設計を維持する
  - もし API がサブドメイン（例: `https://api.example.com`）になる場合は、`PUBLIC_API_BASE_URL` のような環境変数で切り替えられるようにする
  - サブドメイン化は **別オリジン**になるため、CORS は最小（許可オリジンを固定）で設計する

## 2. `updatedAt`（最終更新日）の自動生成

### 2.1 要件

- ブログ記事の `publishedAt` は frontmatter で手動管理
- `updatedAt` は Git の最終更新日時から自動生成する
- 表示仕様: `updatedAt !== publishedAt` のときだけ「最終更新日」を表示

### 2.2 生成方式（推奨）

- `apps/web/scripts/generate-content-metadata.ts`（TypeScript）を用意し、以下を生成する:
  - `apps/web/src/generated/blog-updated-at.json`（または `.ts` エクスポート）
- 生成処理は Git を参照して `apps/web/src/content/blog/**/*.md` の最終コミット日時（ISO 8601）を取得する

期待するコマンド:
- `pnpm gen:meta`（ローカルでも CI でも同じ）
- `pnpm build` の前に `pnpm gen:meta` が必ず走る

補足（モノレポ）:
- `pnpm gen:meta` は `apps/web` で実行する（例: `pnpm -C apps/web gen:meta`）

仕様メモ:
- slug とファイルパスの紐づけは「Content Collection の entry.id（相対パス）」をキーにする  
  - 例: `2026-01-31-example.md` または `2026/01/example.md` のような将来変更にも耐える

## 3. Cloudflare Web Analytics の埋め込み

### 3.1 要件

- Cloudflare Web Analytics のみを導入（GA4 は当面導入しない）
- Cookie 同意 UI は不要（Cloudflare Web Analytics 前提）
- Footer に小さい注記を表示する（例: `Analytics: Cloudflare Web Analytics (cookie-less)`）

### 3.2 実装方針

- Cloudflare Web Analytics は「Cloudflare Pages の one-click setup（自動挿入）」と「手動で script を埋め込む」の 2 方式がある
  - 本プロジェクトは **ローカル/CI でも同じ HTML が生成される**ことを優先し、手動で script を埋め込む方式を採用する
- 共通レイアウト（`apps/web/src/layouts/BaseLayout.astro`）の `</head>` 内に公式スクリプトを挿入する
- `defer` を付け、描画のブロックを避ける
- SSG（MPA）前提のため SPA Measurement は不要とし、`data-cf-beacon` で `spa: false` を明示する（History API のフックや `popstate` 監視を避ける）

設定方針:
- Web Analytics の token は秘匿情報ではないが、差し替えやすいように `PUBLIC_CF_ANALYTICS_TOKEN` として環境変数化する（Astro 側は `import.meta.env.PUBLIC_CF_ANALYTICS_TOKEN`）

挿入するスクリプト（例）:
```html
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token":"YOUR_TOKEN","spa":false}'
></script>
```

注意:
- 手動埋め込みの場合、計測データは `cloudflareinsights.com/cdn-cgi/rum` に送信される（広告ブロッカー等でブロックされることがある）。

## 4. 設定・Secrets 管理（実装指針）

### 4.1 ローカル開発

- `mise` で Node/pnpm のバージョンを固定する（`mise.toml`）
- 環境変数は用途で分ける
  - `PUBLIC_*`（Astro）: **ブラウザに露出する**ためシークレットにしない
  - シークレット（例: Cloudflare API Token 等）: Git 管理しない
- ローカルの変数管理は `mise` に寄せる
  - 既定: `mise.toml`（コミットする。シークレットは置かない）
  - ローカル上書き: `mise.local.toml`（Git 管理しない。`mise.local.toml.example` を雛形にする）
  - Astro/Workers の実行は `mise exec -- <command>` で環境変数を載せたまま行う
    - 例: `mise exec -- pnpm dev`
    - 例: `mise exec -- wrangler pages dev`
  - `.env` / `.dev.vars` は **互換のため残しても良い**が、基本は使わない方針

必要なら（ローカルでシークレットをファイル管理したい場合）:
- `mise` の `env._.file`（dotenv/JSON 等）で読み込み、`redact` でログマスクする運用を検討する  
  - ただし CI/CD や本番のシークレット管理は GitHub/Cloudflare に寄せる（後述）

### 4.2 本番

- Cloudflare Pages 側の環境変数で管理
- KV Binding 名（例: `VISITS_KV`）を固定し、Functions 側で型付けする
