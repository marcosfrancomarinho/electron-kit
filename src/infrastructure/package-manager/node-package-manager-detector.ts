import type {
  PackageManagerDetector,
  PackageManagerName,
} from '../../application/ports/package-manager-detector.js';

export class NodePackageManagerDetector implements PackageManagerDetector {
  detect(environment: NodeJS.ProcessEnv = process.env): PackageManagerName {
    const execPath = environment.npm_execpath ?? '';
    const userAgent = environment.npm_config_user_agent ?? '';

    if (userAgent.startsWith('pnpm')) return 'pnpm';
    if (userAgent.startsWith('yarn')) return 'yarn';
    if (execPath.includes('pnpm')) return 'pnpm';
    if (execPath.includes('yarn')) return 'yarn';

    return 'npm';
  }
}
