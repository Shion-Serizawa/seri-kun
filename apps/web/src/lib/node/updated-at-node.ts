import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createUpdatedAtLoader, type UpdatedAtLoader } from '../updated-at';

export function createFileUpdatedAtLoader(
  filePath: string,
  readFile: (filePath: string) => string | Promise<string> = (p) => fs.readFileSync(p, 'utf8'),
): UpdatedAtLoader {
  return createUpdatedAtLoader(() => readFile(filePath));
}

export function getDefaultBlogUpdatedAtFilePath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '..', 'generated', 'blog-updated-at.json');
}

