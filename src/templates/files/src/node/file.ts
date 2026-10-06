import { readFile, writeFile } from 'node:fs/promises';

export const file = {
  read(path: string) {
    return readFile(path, 'utf8');
  },

  write(path: string, content: string) {
    return writeFile(path, content, 'utf8');
  },
};
