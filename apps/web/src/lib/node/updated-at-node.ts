import fs from 'node:fs';
import path from 'node:path';

import { createUpdatedAtLoader, type UpdatedAtLoader } from '../updated-at';

export function createFileUpdatedAtLoader(
  filePath: string,
  readFile: (filePath: string) => string | Promise<string> = (p) => fs.readFileSync(p, 'utf8'),
): UpdatedAtLoader {
  return createUpdatedAtLoader(() => readFile(filePath));
}

export function getDefaultBlogUpdatedAtFilePath(
  cwdProvider: () => string = () => process.cwd(),
  existsSync: (filePath: string) => boolean = (p) => fs.existsSync(p),
): string {
  const candidates = [
    path.resolve(cwdProvider(), 'src', 'generated', 'blog-updated-at.json'),
    path.resolve(cwdProvider(), 'apps', 'web', 'src', 'generated', 'blog-updated-at.json'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return candidates[0];
}
