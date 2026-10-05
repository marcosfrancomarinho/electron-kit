import { relative } from 'node:path';
import { generatedDir, paths, root, write } from '../project.js';

function modulePath(from: string, to: string) {
  let path = relative(from, to).replaceAll('\\', '/');

  if (!path.startsWith('.')) {
    path = './' + path;
  }

  return path.replace(/\.ts$/, '');
}

export async function generateTypes() {
  const providersImport = modulePath(generatedDir, paths.providers);

  await write(
    paths.types,
    `import type registry from '${providersImport}';

declare module 'electron-kit/browser' {
  interface ProviderTypes {
    readonly __registry__: typeof registry;
  }
}

export {};
`
  );

  console.log(
    `electron-kit: types generated from ${relative(root, paths.providers)}`
  );
}
