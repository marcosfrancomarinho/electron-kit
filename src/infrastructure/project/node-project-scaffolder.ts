import { cp, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { ProjectScaffolder } from '../../application/ports/project-scaffolder.js';
import type { Terminal } from '../../application/ports/terminal.js';

export class NodeProjectScaffolder implements ProjectScaffolder {
  constructor(private readonly terminal: Terminal) {}

  async create(input: {
    projectPath: string;
    projectName: string;
  }): Promise<void> {
    await mkdir(input.projectPath);

    const templates = resolve(
      __dirname,
      '..',
      'src',
      'templates',
      'files',
    );

    await cp(templates, input.projectPath, {
      recursive: true,
    });

    await writeFile(
      join(input.projectPath, 'package.json'),
      this.packageJson(input.projectName),
      'utf8',
    );

    this.terminal.success('📁 Electron project template created');
    this.terminal.success('📦 package.json created');
    this.terminal.success('🔗 Typed provider bridge prepared');
  }

  private packageJson(projectName: string): string {
    return JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        private: true,
        type: 'module',
        main: '.electron-kit/dist/main.cjs',
        scripts: {
          dev: 'node electron-kit/build/dev.cjs',
          build: 'node electron-kit/build/build.cjs',
          package: 'node electron-kit/build/package.cjs',
          type: 'node electron-kit/build/type.cjs',
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          electron: '^44.5.1',
          'electron-builder': '^26.15.3',
          esbuild: '^0.28.2',
          typescript: '7.0.2',
        },
      },
      null,
      2,
    ) + '\n';
  }
}
