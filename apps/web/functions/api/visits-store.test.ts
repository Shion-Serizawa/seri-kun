import { describe, expect, it } from 'vitest';

import { createInMemoryKeyValueStore, createVisitsStore } from './visits-store';

describe('visits store', () => {
  it('reads zero when no total exists', async () => {
    const kv = createInMemoryKeyValueStore();
    const store = createVisitsStore(kv);

    await expect(store.readTotal()).resolves.toBe(0);
  });

  it('increments and reads total visits', async () => {
    const kv = createInMemoryKeyValueStore();
    const store = createVisitsStore(kv);

    await expect(store.incrementTotal()).resolves.toBe(1);
    await expect(store.incrementTotal()).resolves.toBe(2);
    await expect(store.readTotal()).resolves.toBe(2);
  });

  it('treats invalid stored values as zero', async () => {
    const kv = createInMemoryKeyValueStore();
    await kv.put('site:total_visits', 'not-a-number');
    const store = createVisitsStore(kv);

    await expect(store.readTotal()).resolves.toBe(0);
    await expect(store.incrementTotal()).resolves.toBe(1);
  });

  it('applies IP rate limit with TTL', async () => {
    let now = 1_700_000_000_000;
    const kv = createInMemoryKeyValueStore(() => now);
    const store = createVisitsStore(kv);

    await expect(store.isRateLimited('203.0.113.10', 60)).resolves.toBe(false);
    await expect(store.isRateLimited('203.0.113.10', 60)).resolves.toBe(true);

    now += 61_000;
    await expect(store.isRateLimited('203.0.113.10', 60)).resolves.toBe(false);
  });
});
