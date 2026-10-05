import { watch } from 'node:fs';
import { spawn, type ChildProcess } from 'node:child_process';
import { resolve } from 'node:path';
import electron from 'electron';
import { buildProject } from './build.js';
import { distDir, root } from '../project.js';

let child: ChildProcess | undefined;
let timer: NodeJS.Timeout | undefined;
let rebuilding = false;
let pending = false;

async function startElectron() {
  child?.kill();

  const main = resolve(distDir, 'main.mjs');
  const preload = resolve(distDir, 'preload.cjs');

  child = spawn(electron as unknown as string, [main], {
    stdio: 'inherit',
    env: {
      ...process.env,
      ELECTRON_KIT_PRELOAD: preload,
      ELECTRON_KIT_DEV: '1'
    }
  });
}

async function rebuild() {
  if (rebuilding) {
    pending = true;
    return;
  }

  rebuilding = true;

  try {
    await buildProject();
    await startElectron();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  } finally {
    rebuilding = false;

    if (pending) {
      pending = false;
      await rebuild();
    }
  }
}

export async function dev() {
  await rebuild();

  const watcher = watch(
    resolve(root, 'src'),
    { recursive: true },
    () => {
      clearTimeout(timer);
      timer = setTimeout(() => void rebuild(), 120);
    }
  );

  const close = () => {
    watcher.close();
    child?.kill();
  };

  process.once('SIGINT', () => {
    close();
    process.exit(0);
  });

  process.once('SIGTERM', () => {
    close();
    process.exit(0);
  });
}
