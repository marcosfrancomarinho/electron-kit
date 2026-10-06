import {
  createInterface,
  emitKeypressEvents,
} from 'node:readline';
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

  async select(
    query: string,
    options: readonly string[],
  ): Promise<string> {
    if (options.length === 0) {
      throw new Error('Select requires at least one option.');
    }

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
      return this.ask(
        `${query} [${options.map((option) => option.toLowerCase()).join('/')}]: `,
      );
    }

    emitKeypressEvents(process.stdin);

    const input = process.stdin;
    const output = process.stdout;
    const previousRawMode = input.isRaw;
    let selected = 0;

    const render = (initial = false) => {
      if (!initial) {
        output.write(`\x1b[${options.length + 1}A`);
      }

      output.write(
        this.palette.paint(this.palette.cyan, query) + '\n',
      );

      options.forEach((option, index) => {
        const active = index === selected;
        const prefix = active ? '❯ ' : '  ';
        const value = active
          ? this.palette.paint(this.palette.green, option)
          : option;

        output.write(`\x1b[2K${prefix}${value}\n`);
      });
    };

    render(true);
    input.setRawMode(true);
    input.resume();

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        input.off('keypress', onKeypress);
        input.setRawMode(previousRawMode ?? false);
        input.pause();
      };

      const onKeypress = (
        _value: string,
        key: {
          name?: string;
          ctrl?: boolean;
        },
      ) => {
        if (key.ctrl && key.name === 'c') {
          cleanup();
          reject(new Error('Cancelled.'));
          return;
        }

        if (key.name === 'up') {
          selected = (selected - 1 + options.length) % options.length;
          render();
          return;
        }

        if (key.name === 'down') {
          selected = (selected + 1) % options.length;
          render();
          return;
        }

        if (key.name === 'return') {
          const value = options[selected];
          cleanup();
          resolve(value);
        }
      };

      input.on('keypress', onKeypress);
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
    const packageCommand =
      manager === 'npm'
        ? 'npm run package --'
        : manager === 'yarn'
          ? 'yarn package'
          : 'pnpm package';

    console.log(
      '\n' +
        this.palette.paint(
          this.palette.green,
          `✅ Create Kit Electron project "${projectName}" created!`,
        ) +
        '\n\n📦 Dependencies were not installed automatically.' +
        '\n\n📂 Next steps:\n  ' +
        this.palette.paint(this.palette.bold, `cd ${projectName}`) +
        '\n  ' +
        this.palette.paint(this.palette.yellow, install) +
        '\n  ' +
        this.palette.paint(this.palette.yellow, `${run} dev`) +
        '\n\n🚀 Commands:\n  ' +
        this.formatCommand(run, 'dev', 'Run Electron in development') +
        '\n  ' +
        this.formatCommand(run, 'type', 'Check TypeScript types') +
        '\n  ' +
        this.formatCommand(run, 'package', 'Package for the current OS') +
        '\n\n📦 Package targets:\n  ' +
        this.palette.paint(this.palette.yellow, `${packageCommand} win`) +
        '      ' +
        this.palette.paint(this.palette.gray, '# Windows / NSIS') +
        '\n  ' +
        this.palette.paint(this.palette.yellow, `${packageCommand} linux`) +
        '    ' +
        this.palette.paint(this.palette.gray, '# AppImage + .deb') +
        '\n  ' +
        this.palette.paint(this.palette.yellow, `${packageCommand} mac`) +
        '      ' +
        this.palette.paint(this.palette.gray, '# macOS / .dmg') +
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
