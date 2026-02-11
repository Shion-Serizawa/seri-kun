declare module 'node:child_process' {
  export const execFileSync: (...args: any[]) => any;
}

declare module 'node:fs' {
  const fs: any;
  export = fs;
}

declare module 'node:path' {
  const path: any;
  export = path;
}

declare module 'node:url' {
  export const fileURLToPath: (...args: any[]) => any;
  export const pathToFileURL: (...args: any[]) => any;
}

declare const process: any;

