#!/usr/bin/env node

import { buildProject } from './commands/build.js';
import { dev } from './commands/dev.js';
import { packageProject } from './commands/package.js';
import { typeProject } from './commands/type.js';

const command = process.argv[2];

try {
  switch (command) {
    case 'dev':
      await dev();
      break;
    case 'build':
      await buildProject();
      break;
    case 'package':
      await packageProject();
      break;
    case 'type':
      await typeProject();
      break;
    default:
      console.log(`electron-kit

Commands:
  electron-kit dev
  electron-kit build
  electron-kit package
  electron-kit type
`);
  }
} catch (error) {
  console.error(
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
}
