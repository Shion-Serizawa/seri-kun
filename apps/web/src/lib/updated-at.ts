import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type UpdatedAtMap = Record<string, string>;

let cached: UpdatedAtMap | null = null;

function generatedFilePath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..', 'generated', 'blog-updated-at.json');
}

function loadMap(): UpdatedAtMap {
  if (cached) return cached;

  try {
    const raw = fs.readFileSync(generatedFilePath(), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      cached = parsed as UpdatedAtMap;
      return cached;
    }
  } catch {
    // ignore
  }

  cached = {};
  return cached;
}

export function getBlogUpdatedAtIso(entryId: string): string | null {
  const map = loadMap();
  return typeof map[entryId] === 'string' ? map[entryId] : null;
}

