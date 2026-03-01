# Home / Works コンテンツ草案（旧 `Shion-Serizawa.github.io` 抽出）

更新日: 2026-03-01

## 0. 使い方

- このファイルを「今回サイトの文面確定用ドラフト」として編集する。
- 各項目の `現状ステータス` を更新する。
  - `そのまま使う`
  - `要更新`
  - `削除候補`
- `確定文` が埋まったものから実装へ反映する。

## 1. ページ対応方針（今回）

- 旧 `Home` + 旧 `Profile` -> 今回の `Home` に統合
- 旧 `Done` -> 今回の `Works` のベース
- SNS（Twitter / GitHub）リンクは今回も掲載
  - 配置はヘッダー固定ではなく、全体デザインに自然に馴染む位置で実装

## 2. SNS リンク（旧サイト）

- Twitter: `https://x.com/power3goople6`
- GitHub: `https://github.com/Shion-Serizawa`
- 現状ステータス: `確定`
- 確定メモ:XにURLは変更するが、アイコンはTwitterのものを使えば良い。（簡単に取れるなら）

## 3. Home 草案（旧 Home + 旧 Profile）

### 3.1 ヒーロー / 導入文

- 旧文:
  - `Welcome to Seri's site!`
  - `プログラミング、自作PC、ゲーム、アニメ、シラス（ゲンロン）が好きな人間です。`
  - `よろしくおねがいします ( •̀ ω •́ )`
- 現状ステータス: `削除`
- 確定文: 一旦は削除する。全体完成後に必要ならその時に考える

### 3.2 Doing（現在取り組み）

- 旧項目:
  - ``
  - `プリンシプルオブプログラミング`
  - `データ指向アプリケーションデザイン`
  - `JUnit5ドキュメント`
  - `平和と愚かさ`
  - `ロード・エルメロイII世の冒険 9`
- 現状ステータス: `更新済み`
- 確定項目:

### 3.3 Profile 要素（Home へ統合する候補）

#### 経歴

- 旧項目から編集:
  - `4歳: ドラえもんちゃんねるのFlashゲームなどで遊ぶ`
  - `5歳: コンピュータに興味を持ち始める`
  - `15歳: 福井高専入学`
  - `20歳: 福井高専卒業 -> 福井大学編入`
  - `22歳: 地元のIT企業に就職`
- 現状ステータス: `更新済み`
- 確定文:

#### スキル

- 旧項目:
  - `C, SQL, JavaScript, Node-red, Java, Python, React & Next.js with TS（勉強中）`
- 現状ステータス: `確定の方に新しいもの（あからさまに誤字しているのは直して）`
- 確定文:
  - 得意：Java, MySQL, AI Coding(Claude Code, SDD)
  - できる：Git, Docker, Python, Cloudflare Pages, Unix系
  - 触ったことがある：C, JavaScript, TypeScript, Deno, Node-red, React, Next.js, Svelte, Astro

#### 趣味

- 旧項目:
  - `旅行：台湾、北海道、沖縄、広島、福島、新潟`
  - `読書：最近はプログラム関係が多め`
  - `ゲーム（TYPE-MOON, Cyberpunk 2077, Project:;COLD case.mirage）`
  - `アニメ・マンガ・ライトノベル（俺ガイル, 3月のライオン, アオのハコ など）`
  - `YouTube & ニコニコ（旅行、ガジェット、ゲーム、スポーツ、車）`
- 現状ステータス: `更新済み`
- 確定文:

#### メインPC

- 旧項目:
  - `CPU: Intel Core i5 12400F`
  - `CPUクーラー: DEEPCOOL AK400`
  - `GPU: GeForce RTX 5060 Ti Infinity 3 16GB`
  - `電源: Corsair CX650M 650W`
  - `マザーボード: ASUS PRIME B660M-A D4`
  - `メモリ: Crucial 16GB (8GBx2) DDR4-3200`
  - `ケース: Deepcool MACUBE 110`
- 現状ステータス: `更新済み`
- 確定文:

## 4. Works 草案（旧 Done ベース）

### 4.1 作品一覧（初期移植候補）

- 画像があるものは旧リポジトリからコピーしてきて再利用

今回追加
- `MySQL Schema MCP Server`
  - 指定したホストからスキーマ情報、テーブル情報、インデックス情報等を取得するMCP
  - https://github.com/Shion-Serizawa/mcp-first
- `noto_vr`
  - 2025年4月当時の能登を撮影したものをVRで表示できるようにしたもの
  - https://shion-serizawa.github.io/noto_vr/
  - https://github.com/Shion-Serizawa/noto_vr

#### 旧項目

1. `deno_CSVtoSQL`
   - 旧説明: `CSVテキストからSQL INSERT文を生成するページ`
   - 旧リンク:
     - `https://deno-csvtosql.deno.dev/`
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
2. `HelperxHelper`
   - 旧説明: `ホームヘルパー支援システム。インタビュー含めて制作`
   - 旧リンク: なし
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
3. `卒業研究`
   - 旧説明: `Node-red, MariaDB, EVER/IP, Raspberry Pi を用いたセキュアな選挙システム`
   - 旧リンク: なし
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
4. `Discord Bot`
   - 旧説明: `毎時間スケジュールと名言を投稿するBot`
   - 旧リンク:
     - `https://github.com/Shion-Serizawa/discord_schedule_bot`
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
5. `シューティング`
   - 旧説明: `授業課題として作成。キーボード操作、演出にこだわり`
   - 旧リンク:
     - `https://github.com/Shion-Serizawa/java_shooting`
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
6. `ポケモンしりとり`
   - 旧説明: `PokeAPI を使ったしりとり課題`
   - 旧リンク:
     - `https://github.com/Shion-Serizawa/seri-shiritori`
     - `https://shion-seri-shiritori.deno.dev`
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
7. `おさんぽぽん`
   - 旧説明: `jig.jp インターンでのチーム制作（マッチングxおさんぽ）`
   - 旧リンク:
     - `https://github.com/jigintern/2022-summer-2-c`
     - `https://jigintern-2022-summer-2-c.deno.dev/`
   - 現状ステータス: `OK`
   - 確定文:
   - 確定リンク:
8. `過去のお勉強`
   - 旧説明: `HTML, CSS, Linux, Unity, Webスクレイピング, SQL, etc`
   - 現状ステータス: `削除`
   - 確定文:

### 4.2 Works 実装メモ（Astro 側へ反映時）

- `apps/web/src/data/works.ts` に以下を確定データとして投入
  - `title`
  - `description`
  - `tech`
  - `image.src` / `image.alt`
  - `links.url` / `links.github`
- 外部リンク切れチェックを実施してから公開

## 5. 旧サイトから引き継がない要素（現時点）

- `現在時刻` のリアルタイム表示
  - 現状ステータス: `削除`
  - 理由: 今回のポートフォリオ目的に対して優先度が低い

## 6. 次の編集ステップ（このファイル上で実施）

1. `要更新` の項目を現状に合わせて書き換える
2. 残す作品と外す作品を確定する
3. SNS URL を最終確認する
4. 確定後、`apps/web/src/pages/index.astro` と `apps/web/src/data/works.ts` へ反映する
