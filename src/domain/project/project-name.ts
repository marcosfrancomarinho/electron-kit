const INVALID_NAME = /[<>:"/\\|?*\x00-\x1F]/;
const WINDOWS_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export class ProjectName {
  private constructor(private readonly value: string) {}

  static create(value: string): ProjectName {
    const normalized = value.trim();

    if (
      !normalized ||
      normalized === '.' ||
      normalized === '..' ||
      INVALID_NAME.test(normalized) ||
      WINDOWS_RESERVED.test(normalized) ||
      normalized.endsWith('.') ||
      normalized.endsWith(' ')
    ) {
      throw new Error('Invalid project name.');
    }

    return new ProjectName(normalized);
  }

  toString(): string {
    return this.value;
  }
}
