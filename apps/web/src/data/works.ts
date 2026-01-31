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
    title: 'seri-kun',
    description: 'Astro（SSG）+ TypeScript で作るポートフォリオサイト。',
    tech: ['Astro', 'TypeScript', 'Cloudflare Pages'],
    image: {
      src: '/works/placeholder.svg',
      alt: 'seri-kun のスクリーンショット（プレースホルダー）',
    },
    links: {
      github: 'https://github.com/<your-account>/<your-repo>',
    },
  },
  {
    title: 'Example Project',
    description: 'ここに制作物の説明を書きます（短く、要点だけ）。',
    tech: ['TypeScript', 'Node.js'],
    image: {
      src: '/works/placeholder.svg',
      alt: 'Example Project のスクリーンショット（プレースホルダー）',
    },
    links: {
      url: 'https://example.com',
    },
  },
  {
    title: 'No Image Example',
    description: '画像がない場合の表示確認用（テキストだけで崩れないことを担保）。',
    tech: ['Astro', 'CSS Modules'],
    links: {
      github: 'https://github.com/<your-account>/<your-repo>',
    },
  },
] satisfies readonly Work[];
