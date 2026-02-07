import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Minimal TS runner for this repo:
 * - Compiles a single TS entrypoint with the project's TypeScript dependency
 * - Executes the emitted JS with Node
 *
 * This avoids adding runtime dependencies (tsx/ts-node) while keeping scripts authored in TS.
 */

const [scriptPath, ...scriptArgs] = process.argv.slice(2);

if (!scriptPath) {
  console.error('Usage: node scripts/run-ts.mjs <path/to/script.ts> [...args]');
  process.exit(1);
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const absScriptPath = path.resolve(projectRoot, scriptPath);
const outDir = path.resolve(projectRoot, '.tmp', 'ts-scripts');

fs.mkdirSync(outDir, { recursive: true });

const tscPath = path.resolve(projectRoot, 'node_modules', 'typescript', 'lib', 'tsc.js');
const relScriptPath = path.relative(projectRoot, absScriptPath);
if (relScriptPath.startsWith('..') || path.isAbsolute(relScriptPath)) {
  console.error(
    `[run-ts] Refusing to run script outside projectRoot: scriptPath="${scriptPath}" resolved="${absScriptPath}" projectRoot="${projectRoot}"`,
  );
  process.exit(1);
}
const outFilePath = path.resolve(
  outDir,
  path.dirname(relScriptPath),
  `${path.basename(relScriptPath, '.ts')}.js`,
);

const relOut = path.relative(outDir, outFilePath);
if (relOut.startsWith('..') || path.isAbsolute(relOut)) {
  console.error(`[run-ts] Refusing to write outside outDir: outFilePath="${outFilePath}"`);
  process.exit(1);
}

execFileSync(
  process.execPath,
  [
    tscPath,
    absScriptPath,
    '--target',
    'ES2022',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--outDir',
    outDir,
    '--rootDir',
    projectRoot,
    '--declaration',
    'false',
    '--sourceMap',
    'false',
    '--skipLibCheck',
    'true',
  ],
  { stdio: 'inherit' },
);

const outUrl = pathToFileURL(outFilePath).href;

try {
  const mod = await import(outUrl);
  if (typeof mod.main === 'function') {
    await mod.main(scriptArgs);
  }
} catch (error) {
  const message =
    error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
  const stack = error && typeof error === 'object' && 'stack' in error ? String(error.stack) : '';

  console.error(`[run-ts] Failed to run: ${outUrl}`);
  console.error(message);
  if (stack) console.error(stack);
  process.exit(1);
}
