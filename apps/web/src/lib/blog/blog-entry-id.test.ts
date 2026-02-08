import { describe, expect, it } from 'vitest';

import { toBlogRouteId } from './blog-entry-id';

describe('toBlogRouteId', () => {
  it('strips extension from a simple filename', () => {
    expect(toBlogRouteId('2026-01-31-example.md')).toBe('2026-01-31-example');
  });

  it('uses only the last segment for nested ids', () => {
    expect(toBlogRouteId('2026/01/example.md')).toBe('example');
  });

  it('keeps filename when no extension exists', () => {
    expect(toBlogRouteId('plain-slug')).toBe('plain-slug');
  });

  it('removes only the final extension from dotted filenames', () => {
    expect(toBlogRouteId('notes.v2.release.md')).toBe('notes.v2.release');
  });
});
