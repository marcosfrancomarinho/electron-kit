import { ProjectName } from '../../domain/project/project-name.js';
import { CreateProject } from '../../application/create-project.js';
import type { PackageManagerDetector } from '../../application/ports/package-manager-detector.js';
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

      await this.createProject.execute({
        projectName,
        cwd: process.cwd(),
        manager,
        template: 'react',
      });

      this.terminal.showFinalInstructions(projectName, manager);
    } catch (error) {
      this.terminal.error(
        error instanceof Error ? error.message : String(error),
      );
      process.exitCode = 1;
    }
  }
}
