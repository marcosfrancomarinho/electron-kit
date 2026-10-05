export class TerminalPalette {
  readonly reset = '\x1b[0m';
  readonly bold = '\x1b[1m';
  readonly cyan = '\x1b[36m';
  readonly green = '\x1b[32m';
  readonly red = '\x1b[31m';
  readonly yellow = '\x1b[33m';
  readonly gray = '\x1b[90m';
  readonly magenta = '\x1b[35m';

  paint(color: string, value: string): string {
    if (!process.stdout.isTTY) return value;
    return color + value + this.reset;
  }
}
