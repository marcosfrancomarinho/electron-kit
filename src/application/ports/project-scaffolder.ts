import type { ProjectTemplate } from './project-template.js';

export interface CreateProjectStructureInput {
  projectPath: string;
  projectName: string;
  template: ProjectTemplate;
}

export interface ProjectScaffolder {
  create(input: CreateProjectStructureInput): Promise<void>;
}
