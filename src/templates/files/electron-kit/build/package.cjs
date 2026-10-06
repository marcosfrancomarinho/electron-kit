const { spawnSync } = require('node:child_process');
const { mkdir, rm } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const { build: esbuild } = require('esbuild');
const { build } = require('electron-builder');

const projectRoot = resolve(__dirname, '..', '..');
const cache = resolve(projectRoot, 'electron-kit', 'cache');
const browserEntry = existsSync(resolve(projectRoot, 'browser', 'main.tsx'))
  ? 'browser/main.tsx'
  : 'browser/main.ts';

function compilerPath() {
  const packagePath = require.resolve('typescript/package.json', {
    paths: [projectRoot],
  });
  const { bin } = require(packagePath);
  const compiler = typeof bin === 'string' ? bin : bin?.tsc;

  if (!compiler) {
    throw new Error('The installed TypeScript package does not provide tsc.');
  }

  return resolve(dirname(packagePath), compiler);
}

function checkTypes() {
  const result = spawnSync(
    process.execPath,
    [compilerPath(), '--noEmit'],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  );

  if (result.error) throw result.error;

  if (result.status !== 0) {
    throw new Error('TypeScript errors found.');
  }
}

async function compile() {
  checkTypes();

  await rm(cache, { recursive: true, force: true });
  await mkdir(cache, { recursive: true });

  await Promise.all([
    esbuild({
      absWorkingDir: projectRoot,
      entryPoints: ['main.ts'],
      outfile: resolve(cache, 'bundle.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
    }),
    esbuild({
      absWorkingDir: projectRoot,
      entryPoints: ['electron-kit/bridge/preload.ts'],
      outfile: resolve(cache, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
    }),
    esbuild({
      absWorkingDir: projectRoot,
      entryPoints: [browserEntry],
      outfile: resolve(cache, 'browser.js'),
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
    }),
  ]);
}

async function packageProject() {
  await compile();

  await build({
    projectDir: projectRoot,
    config: {
      extraMetadata: {
        main: 'electron-kit/cache/bundle.cjs',
      },
      directories: {
        output: 'release',
      },
      files: [
        'electron-kit/cache/bundle.cjs',
        'electron-kit/cache/browser.js',
        'electron-kit/cache/preload.cjs',
        'browser/index.html',
        'browser/style.css',
        'package.json',
      ],
    },
  });

  console.log('✅ Electron package completed');
}

packageProject().catch((error) => {
  console.error('\n❌ Package failed');
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
