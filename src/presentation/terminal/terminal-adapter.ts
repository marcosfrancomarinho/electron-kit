import { createInterface } from 'node:readline';
import type { PackageManagerName } from '../../application/ports/package-manager-detector.js';
import type { Terminal } from '../../application/ports/terminal.js';
import { TerminalPalette } from './terminal-palette.js';

export class TerminalAdapter implements Terminal {
  constructor(private readonly palette: TerminalPalette) {}

  ask(query: string): Promise<string> {
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      readline.question(
        this.palette.paint(this.palette.cyan, query),
        (answer) => {
          readline.close();
          resolve(answer);
        },
      );
    });
  }

  info(message: string): void {
    console.log(this.palette.paint(this.palette.magenta, message));
  }

  success(message: string): void {
    console.log(this.palette.paint(this.palette.green, message));
  }

  error(message: string): void {
    console.error(
      this.palette.paint(this.palette.red, '❌ Error:') + ' ' + message,
    );
  }

  showFinalInstructions(projectName: string, manager: PackageManagerName): void {
    const install = manager === 'yarn' ? 'yarn' : manager + ' install';
    const run = manager === 'npm' ? 'npm run' : manager;

    console.log(
      '\n' +
        this.palette.paint(
          this.palette.green,
          `✅ Project "${projectName}" created successfully!`,
        ) +
        '\n\n📂 Next steps:\n  ' +
        this.palette.paint(this.palette.bold, `cd ${projectName}`) +
        '\n  ' +
        this.palette.paint(this.palette.yellow, install) +
        '\n  ' +
        this.palette.paint(this.palette.yellow, `${run} dev`) +
        '\n\n🚀 Commands after installing dependencies:\n  ' +
        this.formatCommand(run, 'dev', 'Run Electron in development') +
        '\n  ' +
        this.formatCommand(run, 'build', 'Build the application') +
        '\n  ' +
        this.formatCommand(run, 'package', 'Package the application') +
        '\n  ' +
        this.formatCommand(run, 'type', 'Check TypeScript types') +
        '\n',
    );
  }

  private formatCommand(
    runCommand: string,
    command: string,
    description: string,
  ): string {
    const full = `${runCommand} ${command}`;
    const spacing = ' '.repeat(Math.max(1, 24 - full.length));

    return (
      this.palette.paint(this.palette.yellow, full) +
      spacing +
      this.palette.paint(this.palette.gray, `# ${description}`)
    );
  }
}
