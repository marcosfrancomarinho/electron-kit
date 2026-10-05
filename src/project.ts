import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export const root = process.cwd();
export const kitDir = resolve(root, '.electron-kit');
export const generatedDir = resolve(kitDir, 'generated');
export const distDir = resolve(kitDir, 'dist');

export const paths = {
  main: resolve(root, 'src/node/main.ts'),
  providers: resolve(root, 'src/providers.ts'),
  browser: resolve(root, 'src/browser/main.ts'),
  html: resolve(root, 'src/browser/index.html'),
  preload: resolve(generatedDir, 'preload.ts'),
  types: resolve(generatedDir, 'providers.d.ts')
};

export async function exists(path: string) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function ensureProjectFiles() {
  for (const [name, path] of Object.entries({
    main: paths.main,
    providers: paths.providers,
    browser: paths.browser,
    html: paths.html
  })) {
    if (!(await exists(path))) {
      throw new Error(`Missing ${name} file: ${path}`);
    }
  }
}

export async function write(path: string, content: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content, 'utf8');
}

export async function read(path: string) {
  return readFile(path, 'utf8');
}
