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
const outFilePath = path.resolve(
  outDir,
  path.dirname(relScriptPath),
  `${path.basename(relScriptPath, '.ts')}.js`,
);

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
await import(outUrl).then((mod) => {
  if (typeof mod.main === 'function') return mod.main(scriptArgs);
  return undefined;
});
