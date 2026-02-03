import { describe, expect, it } from 'vitest';

import {
  groupBlogPostsByMonth,
  listBlogTags,
  sortBlogListNewestFirst,
  toMonthKey,
} from './blog-list';

describe('sortBlogListNewestFirst', () => {
  it('sorts by publishedAt descending', () => {
    const items = [
      { id: 'a', title: 'A', publishedAt: '2026-01-01', tags: [], description: 'd' },
      { id: 'b', title: 'B', publishedAt: '2026-02-01', tags: [], description: 'd' },
      { id: 'c', title: 'C', publishedAt: '2025-12-31', tags: [], description: 'd' },
    ];

    const sorted = sortBlogListNewestFirst(items);
    expect(sorted.map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });

  it('uses title as a secondary sort when dates are identical', () => {
    const items = [
      { id: 'b', title: 'b', publishedAt: '2026-01-01', tags: [], description: 'd' },
      { id: 'a', title: 'a', publishedAt: '2026-01-01', tags: [], description: 'd' },
      { id: 'c', title: 'c', publishedAt: '2026-01-02', tags: [], description: 'd' },
    ];

    const sorted = sortBlogListNewestFirst(items);
    expect(sorted.map((x) => x.id)).toEqual(['c', 'a', 'b']);
  });
});

describe('toMonthKey', () => {
  it('returns YYYY-MM for valid YYYY-MM-DD', () => {
    expect(toMonthKey('2026-01-31')).toBe('2026-01');
  });

  it("returns 'unknown' for invalid formats", () => {
    expect(toMonthKey('2026-1-31')).toBe('unknown');
    expect(toMonthKey('2026/01/31')).toBe('unknown');
    expect(toMonthKey('not-a-date')).toBe('unknown');
    expect(toMonthKey('')).toBe('unknown');
  });
});

describe('groupBlogPostsByMonth', () => {
  it('buckets posts by toMonthKey(publishedAt) and sorts months descending', () => {
    const items = [
      { id: 'jan-a', title: 'A', publishedAt: '2026-01-10', tags: [], description: 'd' },
      { id: 'feb', title: 'B', publishedAt: '2026-02-01', tags: [], description: 'd' },
      { id: 'jan-b', title: 'C', publishedAt: '2026-01-01', tags: [], description: 'd' },
      { id: 'bad', title: 'D', publishedAt: '2026/03/01', tags: [], description: 'd' },
    ];

    const groups = groupBlogPostsByMonth(items);
    expect(groups.map((g) => g.month)).toEqual(['unknown', '2026-02', '2026-01']);

    const jan = groups.find((g) => g.month === '2026-01');
    expect(jan?.posts.map((p) => p.id)).toEqual(['jan-a', 'jan-b']);
  });
});

describe('listBlogTags', () => {
  it('extracts unique tags and sorts alphabetically', () => {
    const items = [
      { id: 'a', title: 'A', publishedAt: '2026-01-01', tags: ['z', 'a'], description: 'd' },
      { id: 'b', title: 'B', publishedAt: '2026-01-02', tags: ['a', 'm'], description: 'd' },
      { id: 'c', title: 'C', publishedAt: '2026-01-03', tags: [], description: 'd' },
    ];

    expect(listBlogTags(items)).toEqual(['a', 'm', 'z']);
  });
});
