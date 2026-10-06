import { cp, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ProjectScaffolder } from '../../application/ports/project-scaffolder.js';
import type { Terminal } from '../../application/ports/terminal.js';

export class NodeProjectScaffolder implements ProjectScaffolder {
  constructor(private readonly terminal: Terminal) {}

  async create(input: {
    projectPath: string;
    projectName: string;
    template: 'react';
  }): Promise<void> {
    await mkdir(input.projectPath);

    await cp(this.templates(), input.projectPath, {
      recursive: true,
    });

    await cp(
      this.reactTemplates(),
      join(input.projectPath, 'src', 'ui'),
      { recursive: true },
    );

    await writeFile(
      join(input.projectPath, 'package.json'),
      this.packageJson(input.projectName),
      'utf8',
    );

    this.terminal.success('📁 React project created');
    this.terminal.success('📦 package.json created');
    this.terminal.success('🔗 Typed provider bridge prepared');
  }

  private templates(): string {
    const candidates = [
      resolve(__dirname, '..', 'src', 'templates', 'files'),
      resolve(__dirname, '..', '..', '..', 'src', 'templates', 'files'),
    ];

    const templatePath = candidates.find(existsSync);

    if (!templatePath) {
      throw new Error('Create Kit Electron templates were not found.');
    }

    return templatePath;
  }

  private reactTemplates(): string {
    const candidates = [
      resolve(__dirname, '..', 'src', 'templates', 'react'),
      resolve(__dirname, '..', '..', '..', 'src', 'templates', 'react'),
    ];

    const templatePath = candidates.find(existsSync);

    if (!templatePath) {
      throw new Error('Create Kit Electron React templates were not found.');
    }

    return templatePath;
  }

  private packageJson(projectName: string): string {
    return JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        private: true,
        homepage: 'https://github.com/marcosfrancomarinho/electron-kit',
        type: 'module',
        main: 'kit_electron/cache/bundle.cjs',
        scripts: {
          dev: 'node kit_electron/build/dev.cjs',
          package: 'node kit_electron/build/package.cjs',
          type: 'node kit_electron/build/type.cjs',
        },
        dependencies: {
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
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
