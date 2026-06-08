import { describe, expect, test } from 'vitest';
import { findFirstMarkdownImage, getBlogOgImage, resolveBlogOgImageUrl } from './blog-og-image';

const siteUrl = new URL('https://seri-blog.pages.dev');
const articleUrl = new URL('https://seri-blog.pages.dev/blog/2026-03-01');

describe('findFirstMarkdownImage', () => {
  test('finds the first markdown image in body order', () => {
    expect(
      findFirstMarkdownImage(`
# Title

![first alt](/blog/2026-03-01/first.png)

![second alt](/blog/2026-03-01/second.png)
`),
    ).toEqual({ url: '/blog/2026-03-01/first.png', alt: 'first alt' });
  });

  test('returns null when markdown has no image', () => {
    expect(findFirstMarkdownImage('# Title\n\n本文だけです。')).toBeNull();
  });

  test('ignores image-like text in code blocks', () => {
    expect(
      findFirstMarkdownImage(`
\`\`\`md
![not image](/ignored.png)
\`\`\`

![real image](/real.png)
`),
    ).toEqual({ url: '/real.png', alt: 'real image' });
  });
});

describe('resolveBlogOgImageUrl', () => {
  test('keeps absolute http URLs', () => {
    expect(resolveBlogOgImageUrl('https://example.com/image.png', articleUrl, siteUrl)).toBe(
      'https://example.com/image.png',
    );
  });

  test('resolves root-relative URLs from the site URL', () => {
    expect(resolveBlogOgImageUrl('/blog/2026-03-01/image.png', articleUrl, siteUrl)).toBe(
      'https://seri-blog.pages.dev/blog/2026-03-01/image.png',
    );
  });

  test('resolves article-relative URLs from the article URL directory', () => {
    expect(resolveBlogOgImageUrl('./image.png', articleUrl, siteUrl)).toBe(
      'https://seri-blog.pages.dev/blog/2026-03-01/image.png',
    );
    expect(resolveBlogOgImageUrl('image.png', articleUrl, siteUrl)).toBe(
      'https://seri-blog.pages.dev/blog/2026-03-01/image.png',
    );
  });
});

describe('getBlogOgImage', () => {
  test('returns a resolved OGP image', () => {
    expect(getBlogOgImage('![旧サイトのBlog部分](/blog/2026-03-01/image.png)', articleUrl, siteUrl)).toEqual({
      url: 'https://seri-blog.pages.dev/blog/2026-03-01/image.png',
      alt: '旧サイトのBlog部分',
    });
  });
});
