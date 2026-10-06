import { ProjectName } from '../../domain/project/project-name.js';
import { CreateProject } from '../../application/create-project.js';
import type { PackageManagerDetector } from '../../application/ports/package-manager-detector.js';
import type { ProjectTemplate } from '../../application/ports/project-template.js';
import type { Terminal } from '../../application/ports/terminal.js';

export class CliApplication {
  constructor(
    private readonly createProject: CreateProject,
    private readonly terminal: Terminal,
    private readonly packageManagerDetector: PackageManagerDetector,
  ) {}

  async run(): Promise<void> {
    try {
      const manager = this.packageManagerDetector.detect();
      this.terminal.info(`Using package manager: ${manager}`);

      const projectName = ProjectName.create(
        await this.terminal.ask('Enter project name: '),
      ).toString();

      const template = this.template(
        await this.terminal.ask('Template [vanilla/react]: '),
      );

      await this.createProject.execute({
        projectName,
        cwd: process.cwd(),
        manager,
        template,
      });

      this.terminal.showFinalInstructions(projectName, manager);
    } catch (error) {
      this.terminal.error(
        error instanceof Error ? error.message : String(error),
      );
      process.exitCode = 1;
    }
  }

  private template(value: string): ProjectTemplate {
    const normalized = value.trim().toLowerCase();

    if (!normalized || normalized === 'vanilla') return 'vanilla';
    if (normalized === 'react') return 'react';

    throw new Error('Template must be "vanilla" or "react".');
  }
}
