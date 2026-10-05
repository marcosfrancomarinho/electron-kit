import { build as packageElectron } from 'electron-builder';
import { buildProject } from './build.js';

export async function packageProject() {
  await buildProject();

  await packageElectron({
    config: {
      directories: {
        output: 'release'
      },
      extraMetadata: {
        main: '.electron-kit/dist/main.mjs'
      },
      files: [
        '.electron-kit/dist/**/*',
        'package.json'
      ]
    }
  });
}
