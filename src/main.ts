#!/usr/bin/env node
import { CliApplication } from './presentation/cli/cli-application.js';
import { CreateProject } from './application/create-project.js';
import { NodeProjectScaffolder } from './infrastructure/project/node-project-scaffolder.js';
import { NodePackageManagerDetector } from './infrastructure/package-manager/node-package-manager-detector.js';
import { NodePathResolver } from './infrastructure/project/node-path-resolver.js';
import { TerminalAdapter } from './presentation/terminal/terminal-adapter.js';
import { TerminalPalette } from './presentation/terminal/terminal-palette.js';

const terminal = new TerminalAdapter(new TerminalPalette());
const createProject = new CreateProject(
  new NodeProjectScaffolder(terminal),
  new NodePathResolver(),
);

void new CliApplication(
  createProject,
  terminal,
  new NodePackageManagerDetector(),
).run();
