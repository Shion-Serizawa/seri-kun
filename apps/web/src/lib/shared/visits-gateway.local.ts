import type { VisitsGateway } from './visits-gateway';
import { parseStoredVisits } from './parse-stored-visits';

const DEV_VISITS_STORAGE_KEY = 'seri-kun:total-visits:dev';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createLocalStorageVisitsGateway(
  storage: StorageLike,
  key = DEV_VISITS_STORAGE_KEY,
): VisitsGateway {
  return {
    async incrementAndReadTotal(): Promise<number | null> {
      try {
        const current = parseStoredVisits(storage.getItem(key));
        const next = current + 1;
        storage.setItem(key, String(next));
        return next;
      } catch {
        return null;
      }
    },
    async readTotal(): Promise<number | null> {
      try {
        return parseStoredVisits(storage.getItem(key));
      } catch {
        return null;
      }
    },
  };
}

export function resolveBrowserLocalStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
