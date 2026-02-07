/// <reference path="./node-shim.d.ts" />

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

function findGitRoot(cwd: string): string {
  try {
    const out = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.trim();
  } catch (error) {
    const originalMessage =
      error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
    throw new Error(
      `[findGitRoot] cwd is not inside a git repository: cwd="${cwd}" (original error: ${originalMessage})`,
    );
  }
}

function toPosixPath(p: string): string {
  return p.split(path.sep).join('/');
}

function stripMarkdownExtension(entryId: string): string {
  return entryId.replace(/\.md$/i, '');
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
    const runLog = (): string =>
      execFileSync('git', ['log', '-1', '--format=%cI', '--', relativePathFromRepoRoot], {
        cwd: repoRoot,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

    let out = runLog();
    if (out.length) return out;

    try {
      execFileSync('git', ['fetch', '--unshallow'], { cwd: repoRoot, stdio: 'inherit' });
    } catch {
      // ignore
    }

    out = runLog();
    if (out.length) return out;

    if (process.env.CI) {
      throw new Error(
        `[getLastCommitIso] git log returned empty for "${relativePathFromRepoRoot}". This is often caused by a shallow clone. Configure CI to fetch full history (e.g. actions/checkout with fetch-depth: 0) so updatedAt can be generated.`,
      );
    }

    return null;
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      const message = String(error.message);
      if (message.startsWith('[getLastCommitIso]')) throw error;
    }
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
  const scriptDir = path.dirname(fileURLToPath(import.meta.url));
  const compiledMarker = `${path.sep}.tmp${path.sep}ts-scripts${path.sep}`;
  const uncompiledScriptDir = scriptDir.includes(compiledMarker)
    ? scriptDir.replace(compiledMarker, path.sep)
    : scriptDir;
  const appRoot = path.resolve(uncompiledScriptDir, '..');
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
    const entryIdNoExt = stripMarkdownExtension(entryId);
    const relFromRepo = toPosixPath(path.relative(repoRoot, absFile));
    const lastCommit = getLastCommitIso(repoRoot, relFromRepo);
    if (lastCommit) {
      map[entryId] = lastCommit;
      map[entryIdNoExt] = lastCommit;
    }
  }

  writeJson(outputPath, map);
}

const entryArg = process.argv[1];
if (entryArg) {
  const entryRealPath = fs.realpathSync(path.resolve(entryArg));
  const entryUrl = new URL(pathToFileURL(entryRealPath)).href;
  if (import.meta.url === entryUrl) {
    main();
  }
}
