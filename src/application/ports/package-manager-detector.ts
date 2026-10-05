export type PackageManagerName = 'npm' | 'yarn' | 'pnpm';

export interface PackageManagerDetector {
  detect(): PackageManagerName;
}
