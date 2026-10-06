import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { ProjectTemplate } from '../../application/ports/project-template.js';
import type { ProjectScaffolder } from '../../application/ports/project-scaffolder.js';
import type { Terminal } from '../../application/ports/terminal.js';

export class NodeProjectScaffolder implements ProjectScaffolder {
  constructor(private readonly terminal: Terminal) {}

  async create(input: {
    projectPath: string;
    projectName: string;
    template: ProjectTemplate;
  }): Promise<void> {
    await mkdir(input.projectPath);

    await cp(this.templates(), input.projectPath, {
      recursive: true,
    });

    if (input.template === 'react') {
      await this.applyReactTemplate(input.projectPath);
    }

    await writeFile(
      join(input.projectPath, 'package.json'),
      this.packageJson(input.projectName, input.template),
      'utf8',
    );

    this.terminal.success(`📁 Electron ${input.template} project created`);
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
      throw new Error('Electron Kit templates were not found.');
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
      throw new Error('Electron Kit React templates were not found.');
    }

    return templatePath;
  }

  private async applyReactTemplate(projectPath: string): Promise<void> {
    await rm(join(projectPath, 'ui', 'main.ts'), {
      force: true,
    });

    await cp(
      this.reactTemplates(),
      join(projectPath, 'ui'),
      { recursive: true },
    );
  }

  private packageJson(
    projectName: string,
    template: ProjectTemplate,
  ): string {
    const dependencies =
      template === 'react'
        ? {
            react: '^19.0.0',
            'react-dom': '^19.0.0',
          }
        : {};

    const reactTypes =
      template === 'react'
        ? {
            '@types/react': '^19.0.0',
            '@types/react-dom': '^19.0.0',
          }
        : {};

    return JSON.stringify(
      {
        name: projectName,
        version: '1.0.0',
        private: true,
        homepage: 'https://github.com/marcosfrancomarinho/electron-kit',
        type: 'module',
        main: '.electron-kit/cache/bundle.cjs',
        scripts: {
          dev: 'node .electron-kit/build/dev.cjs',
          package: 'node .electron-kit/build/package.cjs',
          type: 'node .electron-kit/build/type.cjs',
        },
        dependencies,
        devDependencies: {
          '@types/node': '^22.0.0',
          ...reactTypes,
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
