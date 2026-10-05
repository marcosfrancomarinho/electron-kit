import { resolve } from 'node:path';
import type { PathResolver } from '../../application/ports/path-resolver.js';

export class NodePathResolver implements PathResolver {
  resolve(...parts: string[]): string {
    return resolve(...parts);
  }
}
