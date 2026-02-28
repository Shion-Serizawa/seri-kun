import { parseStoredVisits } from '../../src/lib/shared/parse-stored-visits';

const VISITS_KEY = 'site:total_visits';
const VISITS_IP_KEY_PREFIX = 'visits:ip:';

export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface VisitsStore {
  readTotal(): Promise<number>;
  incrementTotal(): Promise<number>;
  isRateLimited(ip: string, ttlSeconds: number): Promise<boolean>;
}

interface InMemoryEntry {
  value: string;
  expiresAtMs: number | null;
}

function toRateLimitKey(ip: string): string {
  return `${VISITS_IP_KEY_PREFIX}${encodeURIComponent(ip)}`;
}

export function createVisitsStore(kv: KeyValueStore): VisitsStore {
  return {
    async readTotal(): Promise<number> {
      const current = await kv.get(VISITS_KEY);
      return parseStoredVisits(current);
    },
    async incrementTotal(): Promise<number> {
      // KV has no atomic increment; read-modify-write is acceptable for low traffic.
      const current = await kv.get(VISITS_KEY);
      const next = parseStoredVisits(current) + 1;
      await kv.put(VISITS_KEY, String(next));
      return next;
    },
    async isRateLimited(ip: string, ttlSeconds: number): Promise<boolean> {
      const key = toRateLimitKey(ip);
      const existing = await kv.get(key);
      if (existing !== null) {
        return true;
      }

      await kv.put(key, '1', { expirationTtl: ttlSeconds });
      return false;
    },
  };
}

export function createInMemoryKeyValueStore(nowMs: () => number = Date.now): KeyValueStore {
  const store = new Map<string, InMemoryEntry>();

  return {
    async get(key: string): Promise<string | null> {
      const entry = store.get(key);
      if (!entry) {
        return null;
      }

      if (entry.expiresAtMs !== null && entry.expiresAtMs <= nowMs()) {
        store.delete(key);
        return null;
      }

      return entry.value;
    },
    async put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> {
      const expirationTtl = options?.expirationTtl;
      const expiresAtMs =
        typeof expirationTtl === 'number' && Number.isFinite(expirationTtl) && expirationTtl > 0
          ? nowMs() + expirationTtl * 1000
          : null;
      store.set(key, { value, expiresAtMs });
    },
  };
}
