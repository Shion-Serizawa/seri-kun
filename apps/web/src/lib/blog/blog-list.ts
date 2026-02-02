export type BlogListItem = Readonly<{
  slug: string;
  title: string;
  publishedAt: string; // YYYY-MM-DD
  tags: readonly string[];
  description: string;
}>;

export type BlogMonthGroup = Readonly<{
  month: string; // YYYY-MM
  posts: readonly BlogListItem[];
}>;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function sortBlogListNewestFirst(items: readonly BlogListItem[]): BlogListItem[] {
  return [...items].sort((a, b) => {
    if (a.publishedAt !== b.publishedAt) return a.publishedAt < b.publishedAt ? 1 : -1;
    return a.title.localeCompare(b.title, 'ja');
  });
}

export function groupBlogPostsByMonth(items: readonly BlogListItem[]): BlogMonthGroup[] {
  const groups = new Map<string, BlogListItem[]>();

  for (const item of items) {
    const month = toMonthKey(item.publishedAt);
    const bucket = groups.get(month);
    if (bucket) bucket.push(item);
    else groups.set(month, [item]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([month, posts]) => ({ month, posts }));
}

export function listBlogTags(items: readonly BlogListItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'en'));
}

export function toMonthKey(publishedAt: string): string {
  if (!ISO_DATE_RE.test(publishedAt)) return 'unknown';
  return publishedAt.slice(0, 7);
}

