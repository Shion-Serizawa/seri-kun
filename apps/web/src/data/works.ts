export type Work = {
  title: string;
  description: string;
  tech: readonly string[];
  image?: {
    src: string;
    alt: string;
  };
  links?: {
    url?: string;
    github?: string;
  };
};

export const works = [
  {
    title: 'MySQL Schema MCP Server',
    description: '指定したホストからスキーマ情報、テーブル情報、インデックス情報などを取得するMCPサーバー。',
    tech: ['TypeScript', 'MCP', 'MySQL'],
    links: {
      github: 'https://github.com/Shion-Serizawa/mcp-first',
    },
  },
  {
    title: 'noto_vr',
    description: '2025年4月当時の能登を撮影したものをVRで表示できるようにした作品。',
    tech: ['A-Frame', 'JavaScript', 'WebVR'],
    image: {
      src: '/works/noto-vr.png',
      alt: 'noto_vr のスクリーンショット',
    },
    links: {
      url: 'https://shion-serizawa.github.io/noto_vr/',
      github: 'https://github.com/Shion-Serizawa/noto_vr',
    },
  },
  {
    title: 'deno_CSVtoSQL',
    description: 'CSVテキストからSQLのINSERT文を生成するツール。',
    tech: ['Deno', 'TypeScript', 'SQL'],
    image: {
      src: '/works/csvtosql.png',
      alt: 'deno_CSVtoSQL の画面',
    },
    links: {
      url: 'https://deno-csvtosql.deno.dev/',
    },
  },
  {
    title: 'HelperxHelper',
    description: '高専プロコン向けに制作したホームヘルパー支援システム。インタビューも含めて設計・開発。',
    tech: ['Web', 'Interview', 'System Design'],
    image: {
      src: '/works/helper.png',
      alt: 'HelperxHelper のシステム構成図',
    },
  },
  {
    title: '卒業研究',
    description: 'Node-RED、MariaDB、EVER/IP、Raspberry Piを用いてセキュアな選挙システムを制作。',
    tech: ['Node-RED', 'MariaDB', 'Raspberry Pi'],
    image: {
      src: '/works/kousei.png',
      alt: '卒業研究システムの構成図',
    },
  },
  {
    title: 'Discord Bot',
    description: '毎時間スケジュールと名言を投稿するBot。習慣化支援を狙って制作。',
    tech: ['Python', 'Discord API', 'Bot'],
    image: {
      src: '/works/disco_bot.png',
      alt: 'Discord Bot の画像',
    },
    links: {
      github: 'https://github.com/Shion-Serizawa/discord_schedule_bot',
    },
  },
  {
    title: 'シューティング',
    description: 'オブジェクト指向言語の授業課題で制作したシューティングゲーム。',
    tech: ['Java', 'Game Development', 'OOP'],
    image: {
      src: '/works/shooting.png',
      alt: 'シューティングゲームのOP画面',
    },
    links: {
      github: 'https://github.com/Shion-Serizawa/java_shooting',
    },
  },
  {
    title: 'ポケモンしりとり',
    description: 'PokeAPIを使って作成したポケモン縛りのしりとりアプリ。',
    tech: ['Deno', 'TypeScript', 'PokeAPI'],
    image: {
      src: '/works/shiritori.png',
      alt: 'ポケモンしりとりの画面',
    },
    links: {
      url: 'https://shion-seri-shiritori.deno.dev',
      github: 'https://github.com/Shion-Serizawa/seri-shiritori',
    },
  },
  {
    title: 'おさんぽぽん',
    description: 'jig.jp インターンで「マッチングxおさんぽ」をテーマに制作したチーム開発作品。',
    tech: ['React', 'Supabase', 'Deno'],
    image: {
      src: '/works/osanpo.png',
      alt: 'おさんぽぽんの技術スタック画像',
    },
    links: {
      url: 'https://jigintern-2022-summer-2-c.deno.dev/',
      github: 'https://github.com/jigintern/2022-summer-2-c',
    },
  },
] satisfies readonly Work[];
