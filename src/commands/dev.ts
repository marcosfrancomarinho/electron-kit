import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { buildProject } from './build.js';
import { distDir } from '../project.js';

export async function dev() {
  await buildProject();

  const main = resolve(distDir, 'main.cjs');
  const preload = resolve(distDir, 'preload.cjs');

  const child = spawn(
    process.platform === 'win32' ? 'electron.cmd' : 'electron',
    [main],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        ELECTRON_KIT_PRELOAD: preload,
        ELECTRON_KIT_DEV: '1'
      },
      shell: process.platform === 'win32'
    }
  );

  child.on('exit', code => {
    process.exitCode = code ?? 0;
  });
}
