# Cloudflare デプロイ準備手順（先にデプロイ検証する版）

更新日: 2026-02-28

目的:
- 先に Cloudflare Pages へデプロイできる状態を作る
- その後にコンテンツ改善へ進む
- 最後に独自ドメインへ切り替える

想定フロー:
1. Cloudflare 準備
2. まず `*.pages.dev` でデプロイ検証
3. コンテンツを詰める
4. ドメイン取得・接続して差し替え

記法:
- `<REPO_ROOT>` はこのリポジトリのルートディレクトリを指す

---

## 1. 最初に決めること（重要）

Cloudflare Pages のプロジェクト作成方式は実質的に固定されるため、先に選ぶ。

- A. **Direct Upload（推奨）**
  - `wrangler pages deploy`（ローカル/CI）でデプロイする方式
  - このリポジトリで予定している `wrangler-action` ベース CD と相性が良い
  - 注意: Direct Upload で作ったプロジェクトは Git integration に切り替え不可
- B. Git integration
  - Cloudflare 側が GitHub push を直接ビルド/デプロイ
  - 注意: Git integration で作ったプロジェクトは Direct Upload に切り替え不可

このリポジトリは `apps/web/functions` を使うため、ダッシュボードの drag-and-drop ではなく Wrangler デプロイを使う（Functions フォルダを含めるため）。

---

## 2. Cloudflare 側の準備（デプロイ前）

### 2.1 アカウント情報

1. Cloudflare アカウント作成
2. `Account ID` を控える（Workers & Pages 画面からコピー可能）

### 2.2 API トークン（GitHub Actions 用）

1. `My Profile > API Tokens > Create Token`
2. Custom Token で作成
3. 最低限の権限:
   - `Account` / `Cloudflare Pages` / `Edit`
4. 発行後、値を安全に保存（再表示不可）

補足:
- 独自ドメイン関連も API で自動化したい場合は DNS 系の権限追加が必要になるが、まずは Pages Deploy 最小権限で開始する。

### 2.3 Pages プロジェクト作成（Direct Upload）

`mise` を使う前提では、`pnpm` / `wrangler` を直接叩くより `mise exec -- ...` の形に統一する。

リポジトリルートで:

```powershell
cd <REPO_ROOT>
mise exec -- pnpm -C apps/web install --frozen-lockfile
mise exec -- pnpm -C apps/web exec wrangler login
mise exec -- pnpm -C apps/web exec wrangler pages project create <PROJECT_NAME> --production-branch main
```

プロンプトで:
- `Project name`: 例 `seri-kun`（上のコマンドで指定済みなら不要）
- `Production branch`: 例 `main`（上のコマンドで指定済みなら不要）

### 2.4 KV 準備（Visits API 用）

`/api/visits` は `VISITS_KV` バインディングを前提にしているため、KV を作る。

推奨:
- Preview 用 Namespace: `seri-kun-visits-preview`
- Production 用 Namespace: `seri-kun-visits-production`

次に Pages プロジェクトの `Settings > Bindings` で、環境ごとに `VISITS_KV` を割り当てる。

重要:
- Binding 追加後は再デプロイが必要

### 2.5 環境変数（必要時）

`PUBLIC_CF_ANALYTICS_TOKEN` を使う場合は Pages 側の環境変数へ設定する。

- `Settings > Variables and Secrets`
- Preview と Production は分けて管理可能

---

## 3. まずはデプロイしてみる（pages.dev 検証）

リポジトリルートで:

```powershell
cd <REPO_ROOT>
mise exec -- pnpm -C apps/web install --frozen-lockfile
mise exec -- pnpm -C apps/web gen:meta
mise exec -- pnpm -C apps/web build
mise exec -- pnpm -C apps/web exec wrangler pages deploy dist --project-name <PROJECT_NAME> --branch main
```

確認項目:
- `https://<PROJECT_NAME>.pages.dev` が表示される
- `/works`, `/blog`, `/blog/[slug]` が表示される
- Footer の `Total Visits` がエラーで壊れない（KV バインド済みなら数値更新）
- `POST /api/visits` が 200/429/403 の想定挙動をする

補足:
- Preview デプロイ確認は `--branch <feature-branch>` で実行する
- Git リポジトリ内なら branch 指定を Wrangler が推測する場合がある

---

## 4. 検証後にコンテンツを詰めるフェーズ

この段階では URL は `pages.dev` のまま運用する。

やること:
1. ブログ/作品データを追加
2. 見た目・文言の最終調整
3. 主要導線（トップ→Works/Blog、記事導線）確認
4. CI（lint/typecheck/test/e2e/build）が常に通る状態を維持

---

## 5. ローカルでのカウンター再現（Cloudflare KV なし）

目的:
- Cloudflare の本番 KV を叩かずに、`/api/visits` とフッター表示の動作確認を行う

前提:
- Functions 側は `VISITS_KV` が無い場合でも、`localhost` ではインメモリストアへフォールバックする実装になっている
- 強制的にローカルストアを使う場合は `VISITS_LOCAL_STORE=memory` を使える

手順（リポジトリルート）:

```powershell
cd <REPO_ROOT>
mise exec -- pnpm -C apps/web install --frozen-lockfile
mise exec -- pnpm -C apps/web build:e2e
$env:VISITS_LOCAL_STORE='memory'
mise exec -- pnpm -C apps/web exec wrangler pages dev dist --port 8788 --ip 127.0.0.1
```

確認:
- `http://127.0.0.1:8788` を開く
- フッターの `Total Visits` が `—` から数値に変わる
- リロードで値が増える（同一 IP の短時間連打はレート制限で増えないことがある）

自動テスト:

```powershell
cd <REPO_ROOT>
mise exec -- pnpm -C apps/web test
```

補足（`astro dev` だけで確認したい場合）:
- `mise exec -- pnpm -C apps/web dev` でもフッターの `Total Visits` は動作する
- この場合は `/api/visits`（Functions）を使わず、開発時限定でブラウザ `localStorage` に保存するフォールバックで再現する
- 値は「そのブラウザのローカル値」であり、Cloudflare KV の値とは連動しない

---

## 6. ドメイン取得して差し替えるフェーズ

### 6.1 ドメイン取得

選択肢:
- Cloudflare Registrar で新規取得
- 既存レジストラで取得済みドメインを使用

### 6.2 Pages にカスタムドメインを追加

`Workers & Pages > <project> > Custom domains > Set up a domain`

注意点:
- Apex (`example.com`) を使うなら、そのドメインを Cloudflare Zone として管理し、ネームサーバーを Cloudflare に向ける必要がある
- Subdomain (`www.example.com` など) は CNAME 接続でも可能

### 6.3 ルーティング/正規化

必要に応じて:
- `www` と apex のどちらを正とするか決定
- `*.pages.dev` から独自ドメインへのリダイレクト設定（Bulk Redirects）

### 6.4 最終確認

1. 独自ドメインで HTTPS が有効
2. 主要ページ表示と API 動作が問題ない
3. Search Console / Analytics などの運用設定を本番ドメインへ切替

---

## 7. このリポジトリ向けチェックリスト

- [ ] Cloudflare `Account ID` を取得済み
- [ ] `CLOUDFLARE_API_TOKEN`（Pages Edit）を発行済み
- [ ] Pages プロジェクトを作成済み（Direct Upload）
- [ ] KV Namespace を Preview/Production で分離作成済み
- [ ] `VISITS_KV` を両環境に Binding 済み
- [ ] `pages.dev` でデプロイ確認済み
- [ ] ローカル（KV なし）でカウンター動作確認済み
- [ ] コンテンツ最終化済み
- [ ] 独自ドメイン追加・証明書有効化済み

---

## 8. 参考（一次情報）

- Cloudflare Pages Direct Upload:
  - https://developers.cloudflare.com/pages/get-started/direct-upload/
- Cloudflare Pages + CI（Wrangler）:
  - https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/
- Wrangler commands（`pages deploy`）:
  - https://developers.cloudflare.com/workers/wrangler/commands/
- Pages Functions Bindings（KV / Variables）:
  - https://developers.cloudflare.com/pages/functions/bindings/
- Pages Functions Wrangler config:
  - https://developers.cloudflare.com/pages/functions/wrangler-configuration/
- Custom domains（Pages）:
  - https://developers.cloudflare.com/pages/configuration/custom-domains/
- Register domain（Cloudflare Registrar）:
  - https://developers.cloudflare.com/registrar/get-started/register-domain/
- Find Account ID:
  - https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/
- Cloudflare wrangler-action（公式）:
  - https://github.com/cloudflare/wrangler-action

---

## 9. `mise` 環境で `npx` / `pnpm` を直打ちしてよいか

- 結論:
  - 再現性を優先するなら **直打ちより `mise exec -- ...` を推奨**
  - このドキュメント内のコマンドは `mise exec` 前提に統一済み
- 理由:
  - `mise.toml` の Node / pnpm バージョン固定を確実に使える
  - グローバル Node/pnpm や PATH 状態に依存しない
- 例外:
  - すでに `mise activate` 済みシェルや shims 経由で同じバージョンが保証されるなら、`pnpm` / `npx` 直打ちでも動く
  - ただしチーム運用では手順のぶれを防ぐため、原則 `mise exec` に寄せる

---

## 10. トラブルシュート（今回のエラー）

- `Not enough non-option arguments: got 0, need at least 1`
  - 原因: `wrangler pages project create` に `project-name` を渡していない
  - 対処:
    - `mise exec -- pnpm -C apps/web exec wrangler pages project create <PROJECT_NAME> --production-branch main`

- `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL Command "wrangler" not found`
  - 主な原因: `apps/web` で依存インストール前
  - 対処:
    - `mise exec -- pnpm -C apps/web install --frozen-lockfile`
    - 確認: `mise exec -- pnpm -C apps/web exec wrangler --version`
