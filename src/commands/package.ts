import { spawn } from 'node:child_process';
import { buildProject } from './build.js';

export async function packageProject() {
  await buildProject();

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.platform === 'win32' ? 'electron-builder.cmd' : 'electron-builder',
      [
        '--config.extraMetadata.main=.electron-kit/dist/main.cjs',
        '--config.directories.output=release'
      ],
      {
        stdio: 'inherit',
        shell: process.platform === 'win32'
      }
    );

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`electron-builder exited with code ${code}`));
    });
  });
}
