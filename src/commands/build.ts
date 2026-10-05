import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { distDir, ensureProjectFiles, paths, write } from '../project.js';
import { generateTypes } from './type.js';

const preloadSource = `import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('__electronKit', {
  invoke(token: string, method: string | null, args: unknown[]) {
    return ipcRenderer.invoke('electron-kit:invoke', token, method, args);
  }
});
`;

export async function buildProject() {
  await ensureProjectFiles();
  await generateTypes();

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await write(paths.preload, preloadSource);

  await Promise.all([
    build({
      entryPoints: [paths.main],
      outfile: resolve(distDir, 'main.mjs'),
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node22',
      external: ['electron']
    }),
    build({
      entryPoints: [paths.preload],
      outfile: resolve(distDir, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron']
    }),
    build({
      entryPoints: [paths.browser],
      outfile: resolve(distDir, 'browser.js'),
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es2022'
    })
  ]);

  await cp(paths.html, resolve(distDir, 'index.html'));

  console.log('electron-kit: build complete');
}
