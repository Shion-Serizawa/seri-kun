# seri-kun

## セットアップ（ローカル）

このリポジトリは `mise.toml` で Node / pnpm を固定します。

```sh
mise trust
mise install
```

ローカル専用の環境変数が必要な場合は、`mise.local.toml.example` を参考に `mise.local.toml` を作成してください（Git 管理しません）。

```sh
cp mise.local.toml.example mise.local.toml
```

注意:
- `PUBLIC_*` はブラウザに露出するためシークレットにしない
- `.env` / `.dev.vars` 等のシークレットは Git 管理しない（`.gitignore` 済み）

## 動作確認（Commit 1 時点）

Astro アプリは `apps/web` です（作業はリポジトリルートから行う前提）。

### 1) 開発サーバー起動

```sh
mise exec -- pnpm -C apps/web dev
```

ブラウザで `http://localhost:4321/` を開き、トップページが表示されれば OK です。

### 2) ビルド（SSG）

```sh
mise exec -- pnpm -C apps/web build
```

`apps/web/dist/` が生成されれば OK です（静的出力）。

### 2.5) 型チェック（公式推奨）

```sh
mise exec -- pnpm -C apps/web typecheck
```

`astro build` 自体は型チェックを行わないため、CI/ローカルで明示的に `astro check`（このリポジトリでは `typecheck`）を実行します。

### 3) ビルド成果物のプレビュー

```sh
mise exec -- pnpm -C apps/web preview
```
