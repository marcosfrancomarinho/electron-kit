const { spawnSync } = require('node:child_process');
const { mkdir, rm } = require('node:fs/promises');
const { existsSync } = require('node:fs');
const { dirname, resolve } = require('node:path');
const { build: esbuild } = require('esbuild');
const { build, Platform } = require('electron-builder');

const projectRoot = resolve(__dirname, '..', '..');
const cache = resolve(projectRoot, '_electron_kit', 'cache');

const uiEntry = existsSync(
  resolve(projectRoot, 'src', 'ui', 'main.tsx'),
)
  ? 'src/ui/main.tsx'
  : 'src/ui/main.ts';

function compilerPath() {
  const packagePath = require.resolve('typescript/package.json', {
    paths: [projectRoot],
  });
  const { bin } = require(packagePath);
  const compiler = typeof bin === 'string' ? bin : bin?.tsc;

  if (!compiler) {
    throw new Error(
      'The installed TypeScript package does not provide tsc.',
    );
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
      entryPoints: ['_electron_kit/bridge/preload.ts'],
      outfile: resolve(cache, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
    }),
    esbuild({
      absWorkingDir: projectRoot,
      entryPoints: [uiEntry],
      outfile: resolve(cache, 'browser.js'),
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
    }),
  ]);
}

function currentPlatform() {
  if (process.platform === 'win32') return 'win';
  if (process.platform === 'darwin') return 'mac';
  return 'linux';
}

function targetPlatform(name) {
  switch (name) {
    case 'win':
    case 'windows':
      return Platform.WINDOWS.createTarget();

    case 'mac':
    case 'macos':
      return Platform.MAC.createTarget();

    case 'linux':
      return Platform.LINUX.createTarget();

    default:
      throw new Error(
        'Invalid platform. Use win, mac or linux.',
      );
  }
}

async function packageProject() {
  await compile();

  const requested = process.argv[2] ?? currentPlatform();
  const targets = targetPlatform(requested);

  console.log(`📦 Packaging for ${requested}`);

  await build({
    projectDir: projectRoot,
    targets,
    config: {
      extraMetadata: {
        main: '_electron_kit/cache/bundle.cjs',
      },
      directories: {
        output: 'release',
      },
      files: [
        '_electron_kit/cache/bundle.cjs',
        '_electron_kit/cache/browser.js',
        '_electron_kit/cache/preload.cjs',
        'src/ui/index.html',
        'src/ui/style.css',
        'package.json',
      ],
      win: {
        target: ['nsis'],
      },
      linux: {
        target: ['AppImage', 'deb'],
        category: 'Utility',
        maintainer: 'Electron Kit',
      },
      mac: {
        target: ['dmg'],
        category: 'public.app-category.utilities',
      },
    },
  });

  console.log('✅ Electron package completed');
}

packageProject().catch((error) => {
  console.error('\n❌ Package failed');
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
