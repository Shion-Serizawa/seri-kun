import { describe, expect, it } from 'vitest';

import { parseSelectedTag } from './parse-selected-tag';

describe('parseSelectedTag', () => {
  it('returns null when tag is missing', () => {
    expect(parseSelectedTag('', ['a'])).toBeNull();
    expect(parseSelectedTag('?x=1', ['a'])).toBeNull();
  });

  it('returns null when tag is not in knownTags', () => {
    expect(parseSelectedTag('?tag=b', ['a'])).toBeNull();
  });

  it('returns the tag when present and known', () => {
    expect(parseSelectedTag('?tag=a', ['a', 'b'])).toBe('a');
  });
});

