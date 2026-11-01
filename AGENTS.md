# Repo AGENTS.md（全体指針）

このファイルは、このリポジトリで実装・修正を行う際の「前提」「構成」「保守性のためのルール」をまとめたものです。

## 0. 目的 / スコープ

- 目的: `apps/web` のポートフォリオサイトを **Astro（SSG）+ TypeScript** で実装し、最小限の動的処理を **Cloudflare Pages Functions** に寄せる。
- 非目的（初期段階）: Kotlin バックエンドの実装（将来 `apps/backend` が入る前提のモノレポ設計のみ）。

## 1. 技術スタック（前提）

- Frontend: Astro（SSG）, TypeScript（strict）
- Runtime / Toolchain: Node / pnpm（`mise.toml` で固定）, Vite+（`vp`。`apps/web` の devDependencies で固定）
- Edge API: Cloudflare Pages Functions + Cloudflare KV
- CI: GitHub Actions
- Testing: `vp check`（Oxfmt / Oxlint / tsgolint）/ `astro check` / `vp test`（Vitest）/ Playwright（E2E）

## 2. ディレクトリ（現状と将来）

`work-docs/02-non-page-spec.md` の提案を正とする:

```
apps/
  web/                 Astro（SSG）+ Cloudflare Pages Functions
    src/               UI / pages / content / generated / data / lib
    functions/         Cloudflare Pages Functions（API）
    scripts/           生成スクリプト（TS）
  backend/             Kotlin API（将来・初期は作らない）
contracts/             API契約（将来）
work-docs/             設計ドキュメント（作業用）
docs/                  確定ドキュメント（必要になったら）
```

## 3. リポジトリ全体の不変条件（保守性の要）

- サイト本体は **SSG** を維持する（Astro の `output: 'static'` を基本方針）。
- 動的処理は原則 **`/api/*`（Pages Functions）** に閉じ込める。
- `updatedAt` は Git 履歴から自動生成する（CI では `fetch-depth: 0` が必須）。
- シークレットは Git 管理しない（`.env` / `.dev.vars` / `mise.local.toml` などはコミット対象外）。
- 変更は小さく（レビュー可能な粒度）、`work-docs/05-implementation-plan.md` のコミット方針に沿って進める。

## 4. コーディング規約（全体）

- TypeScript:
  - `any` を避け、`unknown` + 変換、`satisfies`、型ガードで安全にする。
  - 例外的に型を緩める場合は「境界（IO/外部）」に寄せ、内部は型安全を維持する。
- 依存関係:
  - “latest” 追従はしない。`package.json` / lockfile で固定し、アップグレードは意図的に行う。
  - Astro は v7 を使用する。旧版（v6 以前）の docs / 記事を参照していないか常に確認する。
- サプライチェーン対策（`pnpm-workspace.yaml` / CI で強制）:
  - バージョンは `^` / `~` なしの完全固定。lockfile は `--frozen-lockfile` で検証する。
  - 公開から 7 日未満のバージョンは入れない（`minimumReleaseAge`）。
  - install script は `allowBuilds` に明示したものだけ許可する。追加は理由を添えてレビューする。
  - GitHub Actions はタグではなくコミット SHA で固定する。
- ロジック分離:
  - UI（Astro/HTML/CSS）とドメインロジック（並び替え・グルーピング等）を分離し、後者は `*.ts` に寄せてユニットテスト可能にする。
- エラー/ログ:
  - 本番でのログ・例外メッセージは最小限（設定不備や秘匿情報を漏らさない）。
  - 開発時の診断ログは許可（ただしビルド成果物や本番へ漏れないよう制御）。

## 5. 自動テスト / CI（概要）

- 最低限の合格ライン（CI）:
  - `lint` / `typecheck` / `test` / `build` が成功
  - `updatedAt` 生成が CI でも再現できる（Git 履歴が必要）
- 詳細は `work-docs/03-testing.md` と `.github/**/AGENTS.md` を参照。

## 6. 参照（一次情報）

- 内部仕様:
  - `work-docs/01-page-spec.md`
  - `work-docs/02-non-page-spec.md`
  - `work-docs/03-testing.md`
  - `work-docs/04-ci-cd.md`
  - `work-docs/05-implementation-plan.md`
- Astro（公式）:
  - https://docs.astro.build/
  - v7 アップグレードガイド: https://docs.astro.build/en/guides/upgrade-to/v7/
- Vite+（公式）:
  - https://viteplus.dev/
- Cloudflare（公式）:
  - Pages: https://developers.cloudflare.com/pages/
  - Pages Functions: https://developers.cloudflare.com/pages/functions/
  - Workers（テスト/設定の一次情報）: https://developers.cloudflare.com/workers/
- GitHub Actions（公式）:
  - https://docs.github.com/actions
