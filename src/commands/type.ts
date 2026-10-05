import { relative } from 'node:path';
import ts from 'typescript';
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

export async function typeProject() {
  await generateTypes();

  const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');

  if (!configPath) {
    throw new Error('Missing tsconfig.json.');
  }

  const config = ts.readConfigFile(configPath, ts.sys.readFile);

  if (config.error) {
    throw new Error(ts.formatDiagnostic(config.error, formatHost));
  }

  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    root,
    undefined,
    configPath
  );

  if (!parsed.fileNames.includes(paths.types)) {
    parsed.fileNames.push(paths.types);
  }

  const program = ts.createProgram({
    rootNames: parsed.fileNames,
    options: parsed.options
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);

  if (diagnostics.length > 0) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
    );
  }

  console.log('electron-kit: TypeScript OK');
}

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: fileName => fileName,
  getCurrentDirectory: () => root,
  getNewLine: () => ts.sys.newLine
};
