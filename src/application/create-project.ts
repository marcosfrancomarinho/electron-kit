import type { PathResolver } from './ports/path-resolver.js';
import type { ProjectScaffolder } from './ports/project-scaffolder.js';
import type { PackageManagerName } from './ports/package-manager-detector.js';

export interface CreateProjectInput {
  projectName: string;
  cwd: string;
  manager: PackageManagerName;
}

export interface CreateProjectOutput {
  projectPath: string;
  manager: PackageManagerName;
}

export class CreateProject {
  constructor(
    private readonly projectScaffolder: ProjectScaffolder,
    private readonly pathResolver: PathResolver,
  ) {}

  async execute(input: CreateProjectInput): Promise<CreateProjectOutput> {
    const projectPath = this.pathResolver.resolve(input.cwd, input.projectName);

    await this.projectScaffolder.create({
      projectPath,
      projectName: input.projectName,
    });

    return {
      projectPath,
      manager: input.manager,
    };
  }
}
