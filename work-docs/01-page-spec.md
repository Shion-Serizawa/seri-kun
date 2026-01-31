# ページ仕様（Astro / TypeScript 前提）

更新日: 2026-01-31

このドキュメントは `work-docs/first-impression.md` を「実装できる粒度」に落とし込んだページ仕様です。

## 0. 前提（Astro の最新状況を踏まえた判断）

- Astro は安定版として v5 系が提供されており、公式ドキュメント上の「latest」は v5.16.6（2026-01-31 時点）。v6 は Upgrade Guide が存在し、ベータ扱い（アップグレード手順に `beta` が出る）。  
- Node.js 要件（Astro v5）: 18.20.0 / 20.3.0 / 22.0.0 以上。v6 を採用する場合は 22.12.0 以上が必須。
- 2026-01-16 に Cloudflare が Astro を買収（プロダクト継続は前提として、Cloudflare Pages/Workers との親和性がさらに高まる想定）。

採用方針:
- 初期実装は **Astro v5（安定版）** を前提にする
- すべて **TypeScript（strict）** で書く（`.astro` の frontmatter / `src/**/*.ts` / Cloudflare Pages Functions も含む）
- 動的処理はアクセスカウンター API のみに限定し、サイト自体は **静的生成（SSG）** を維持する

## 1. ルーティング（確定）

```
/                Home
/works           制作物一覧（1ページ完結）
/blog            ブログ一覧（タグ・年月で整理）
/blog/[slug]     ブログ記事詳細
```

採用しない:
- `/works/[slug]`（制作物の詳細ページ）
- フォーム（問い合わせ）

## 2. 共通レイアウト仕様

### 2.1 共通 UI

- Header
  - サイト名（Home へのリンク）
  - ナビ: `Works` / `Blog`
- Main
  - ページ本文
- Footer（全ページ共通）
  - サイト全体の累計アクセス数（Total Visits）
  - 小さい注記（解析）
    - 文言例: `Analytics: Cloudflare Web Analytics (cookie-less)`
    - リンクは任意（貼る場合は Cloudflare Web Analytics の説明ページなど）

### 2.2 レスポンシブ

- モバイルファースト
- 1カラムを基本、`/works` のカードだけ 2〜3 カラムを許可

### 2.3 アクセシビリティ（最低限）

- `h1` は各ページに 1 つ
- ナビゲーションは `nav` 要素
- 主要ランドマーク: `header` / `main` / `footer`
- コントラスト確保（WCAG AA を目安）

### 2.4 SEO / OGP（最低限）

- 全ページ: `title`, `meta description`, `canonical`
- OGP: `og:title`, `og:description`, `og:type`, `og:url`
- `sitemap.xml` / `robots.txt` は Astro 側で生成（またはビルド成果物として用意）

## 3. 各ページ仕様

### 3.1 Home (`/`)

目的: 自己紹介 + 導線（Works/Blog）+ 最低限の信頼情報

表示要素:
- 自己紹介（短文）
- 制作物サマリ（最新/代表 3 件程度）
  - `/works` への導線
- 最新ブログ記事（最新 3 件程度）
  - `/blog` への導線
- Footer に Total Visits

受け入れ条件:
- Works と Blog への導線がファーストビューに 1 つ以上存在する
- 最新記事が 0 件でも崩れない（空状態テキスト）

### 3.2 Works (`/works`)

目的: 制作物を「一覧で見せる」だけに徹する（1ページ完結）

表示要素（制作物カード）:
- タイトル
- 短い説明
- 使用技術（タグ風）
- GitHub URL / 公開 URL（任意）

データ形:
- 初期は `src/data/works.ts`（配列、型付き）で管理し、後から Content Collection 化できるようにする

受け入れ条件:
- 1ページで全制作物が閲覧できる（ページングなし）

### 3.3 Blog 一覧 (`/blog`)

目的: 探しやすい一覧（タグ・年月）

表示要素:
- 記事一覧（新しい順）
- タグでの絞り込み
  - URL で状態を持つ（例: `/blog?tag=infra`）
  - 未指定なら全件
- 年月でのグルーピング表示（例: `2026-01`）

受け入れ条件:
- タグ絞り込みで URL が変化し、リロードしても同じ状態になる
- 記事が 0 件でも崩れない（空状態テキスト）

### 3.4 Blog 記事 (`/blog/[slug]`)

目的: Markdown を読みやすく表示する

表示要素:
- タイトル
- 投稿日 `publishedAt`
- 最終更新日 `updatedAt`（`publishedAt` と異なる場合のみ表示）
- タグ
- 本文（Markdown）

受け入れ条件:
- `updatedAt` は「Git の最終更新日時」由来で表示される（管理者の手動入力不要）

## 4. コンテンツ仕様（ブログ）

### 4.1 配置

```
src/content/blog/
  2026-01-31-example.md
```

### 4.2 frontmatter（TS スキーマ化対象）

```yaml
title: "記事タイトル"
slug: "example"
publishedAt: "2026-01-31"
tags: ["kotlin", "infra"]
draft: false
description: "記事の要約"
```

### 4.3 日付の意味論（重要）

- `publishedAt`: 意味論としての公開日（手動で frontmatter に記述）
- `updatedAt`: Git の最終更新日時（CI/CD で自動生成して表示に使用）

## 5. TypeScript 方針（ページ実装）

- Astro コンポーネントの frontmatter は TypeScript で記述する
- `src/content.config.ts`（Content Collections）は TypeScript で定義する
- `tsconfig.json` は Astro の strict 既定をベースにし、追加で `noUncheckedIndexedAccess` 等も有効化する（初期から厳しめ）
