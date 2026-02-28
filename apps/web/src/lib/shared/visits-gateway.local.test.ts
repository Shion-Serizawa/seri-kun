import { describe, expect, it } from 'vitest';

import { createLocalStorageVisitsGateway } from './visits-gateway.local';

class MemoryStorage {
  private readonly store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('createLocalStorageVisitsGateway', () => {
  it('increments and reads total', async () => {
    const storage = new MemoryStorage();
    const gateway = createLocalStorageVisitsGateway(storage, 'test:visits');

    await expect(gateway.incrementAndReadTotal()).resolves.toBe(1);
    await expect(gateway.incrementAndReadTotal()).resolves.toBe(2);
    await expect(gateway.readTotal()).resolves.toBe(2);
  });

  it('treats invalid existing values as zero', async () => {
    const storage = new MemoryStorage();
    storage.setItem('test:visits', 'bad');
    const gateway = createLocalStorageVisitsGateway(storage, 'test:visits');

    await expect(gateway.incrementAndReadTotal()).resolves.toBe(1);
  });

  it('returns null when storage operations throw', async () => {
    const storage = {
      getItem(): string | null {
        throw new Error('read failed');
      },
      setItem(): void {
        throw new Error('write failed');
      },
    };
    const gateway = createLocalStorageVisitsGateway(storage, 'test:visits');

    await expect(gateway.incrementAndReadTotal()).resolves.toBeNull();
    await expect(gateway.readTotal()).resolves.toBeNull();
  });
});
