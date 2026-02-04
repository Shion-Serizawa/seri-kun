/// <reference path="./node-shim.d.ts" />

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function findGitRoot(cwd: string): string {
  const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  return out.trim();
}

function toPosixPath(p: string): string {
  return p.split(path.sep).join('/');
}

function listMarkdownFiles(rootDir: string): string[] {
  const out: string[] = [];

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) out.push(full);
    }
  };

  walk(rootDir);
  return out.sort((a, b) => a.localeCompare(b, 'en'));
}

function getLastCommitIso(repoRoot: string, relativePathFromRepoRoot: string): string | null {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relativePathFromRepoRoot], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return out.length ? out : null;
  } catch {
    return null;
  }
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath: string, data: unknown): void {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export function main(): void {
  const appRoot = path.resolve(process.cwd());
  const repoRoot = findGitRoot(appRoot);

  const blogRoot = path.resolve(appRoot, 'src', 'content', 'blog');
  const generatedDir = path.resolve(appRoot, 'src', 'generated');
  const outputPath = path.resolve(generatedDir, 'blog-updated-at.json');

  ensureDir(generatedDir);

  if (!fs.existsSync(blogRoot)) {
    writeJson(outputPath, {});
    return;
  }

  const files = listMarkdownFiles(blogRoot);
  const map: Record<string, string> = {};

  for (const absFile of files) {
    const entryId = toPosixPath(path.relative(blogRoot, absFile));
    const relFromRepo = toPosixPath(path.relative(repoRoot, absFile));
    const lastCommit = getLastCommitIso(repoRoot, relFromRepo);
    if (lastCommit) map[entryId] = lastCommit;
  }

  writeJson(outputPath, map);
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  main();
}
