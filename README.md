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
