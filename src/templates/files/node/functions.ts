import { readFile, writeFile } from 'node:fs/promises';

export const functions = {
  file: {
    read(path: string) {
      return readFile(path, 'utf8');
    },

    write(path: string, content: string) {
      return writeFile(path, content, 'utf8');
    },
  },

  system: {
    platform() {
      return process.platform;
    },

    cwd() {
      return process.cwd();
    },
  },

  version() {
    return '1.0.0';
  },
};
