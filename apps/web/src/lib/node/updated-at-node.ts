import fs from 'node:fs';
import path from 'node:path';

import { createUpdatedAtLoader, type UpdatedAtLoader } from '../updated-at';

export function createFileUpdatedAtLoader(
  filePath: string,
  readFile: (filePath: string) => string | Promise<string> = (p) => fs.readFileSync(p, 'utf8'),
): UpdatedAtLoader {
  return createUpdatedAtLoader(() => readFile(filePath));
}

export function getDefaultBlogUpdatedAtFilePath(): string {
  const candidates = [
    path.resolve(process.cwd(), 'src', 'generated', 'blog-updated-at.json'),
    path.resolve(process.cwd(), 'apps', 'web', 'src', 'generated', 'blog-updated-at.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return candidates[0];
}
