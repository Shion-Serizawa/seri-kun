import { fromMarkdown } from 'mdast-util-from-markdown';

export type BlogOgImage = {
  url: string;
  alt: string | null;
};

type MarkdownNode = {
  type?: unknown;
  url?: unknown;
  alt?: unknown;
  children?: unknown;
};

function isMarkdownNode(value: unknown): value is MarkdownNode {
  return typeof value === 'object' && value !== null;
}

function getChildNodes(node: MarkdownNode): MarkdownNode[] {
  if (!Array.isArray(node.children)) {
    return [];
  }

  return node.children.filter(isMarkdownNode);
}

export function findFirstMarkdownImage(markdown: string): BlogOgImage | null {
  const tree: unknown = fromMarkdown(markdown);
  if (!isMarkdownNode(tree)) {
    return null;
  }

  const visit = (node: MarkdownNode): BlogOgImage | null => {
    if (node.type === 'image' && typeof node.url === 'string' && node.url.length > 0) {
      const alt = typeof node.alt === 'string' && node.alt.length > 0 ? node.alt : null;
      return { url: node.url, alt };
    }

    for (const child of getChildNodes(node)) {
      const found = visit(child);
      if (found) {
        return found;
      }
    }

    return null;
  };

  return visit(tree);
}

function toHttpUrl(url: URL): string | null {
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }

  return url.toString();
}

function ensureTrailingSlash(url: URL): URL {
  const nextUrl = new URL(url);
  if (!nextUrl.pathname.endsWith('/')) {
    nextUrl.pathname = `${nextUrl.pathname}/`;
  }
  return nextUrl;
}

export function resolveBlogOgImageUrl(imageUrl: string, articleUrl: URL, siteUrl: URL): string | null {
  try {
    if (imageUrl.startsWith('/')) {
      return toHttpUrl(new URL(imageUrl, siteUrl));
    }

    if (/^https?:\/\//i.test(imageUrl)) {
      return toHttpUrl(new URL(imageUrl));
    }

    return toHttpUrl(new URL(imageUrl, ensureTrailingSlash(articleUrl)));
  } catch {
    return null;
  }
}

export function getBlogOgImage(markdown: string, articleUrl: URL, siteUrl: URL): BlogOgImage | null {
  const image = findFirstMarkdownImage(markdown);
  if (!image) {
    return null;
  }

  const url = resolveBlogOgImageUrl(image.url, articleUrl, siteUrl);
  return url ? { ...image, url } : null;
}
