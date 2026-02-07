export type UpdatedAtMap = Record<string, string>;

export type UpdatedAtLoader = Readonly<{
  getMap: () => Promise<UpdatedAtMap>;
  getBlogUpdatedAtIso: (entryId: string) => Promise<string | null>;
  clearCache: () => void;
}>;

export function createUpdatedAtLoader(
  readJson: () => string | Promise<string>,
  fallback: UpdatedAtMap = {},
): UpdatedAtLoader {
  let cache: UpdatedAtMap | null = null;

  const getMap = async (): Promise<UpdatedAtMap> => {
    if (cache) return cache;

    try {
      const raw = await readJson();
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        cache = parsed as UpdatedAtMap;
        return cache;
      }
    } catch {
      // ignore (use fallback)
    }

    cache = fallback;
    return cache;
  };

  return {
    getMap,
    getBlogUpdatedAtIso: async (entryId: string) => {
      const map = await getMap();
      return typeof map[entryId] === 'string' ? map[entryId] : null;
    },
    clearCache: () => {
      cache = null;
    },
  };
}

