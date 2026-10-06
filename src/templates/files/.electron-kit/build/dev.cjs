const { spawn, spawnSync } = require('node:child_process');
const { mkdir, rm } = require('node:fs/promises');
const { existsSync, watch } = require('node:fs');
const { dirname, resolve } = require('node:path');
const { build } = require('esbuild');
const electron = require('electron');

const projectRoot = resolve(__dirname, '..', '..');
const cache = resolve(projectRoot, '.electron-kit', 'cache');
const uiEntry = existsSync(resolve(projectRoot, 'ui', 'main.tsx'))
  ? 'ui/main.tsx'
  : 'ui/main.ts';

let child;
let timer;
let rebuilding = false;
let pending = false;

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
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['main.ts'],
      outfile: resolve(cache, 'bundle.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
    }),
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['.electron-kit/bridge/preload.ts'],
      outfile: resolve(cache, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
    }),
    build({
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

async function stopElectron() {
  const processToStop = child;
  child = undefined;

  if (
    !processToStop ||
    processToStop.exitCode !== null ||
    processToStop.signalCode !== null
  ) {
    return;
  }

  await new Promise((resolveExit) => {
    processToStop.once('exit', resolveExit);
    processToStop.kill('SIGTERM');
  });
}

async function startElectron() {
  await stopElectron();

  child = spawn(
    electron,
    [resolve(cache, 'bundle.cjs')],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  );
}

async function rebuild() {
  if (rebuilding) {
    pending = true;
    return;
  }

  rebuilding = true;

  try {
    await compile();
    await startElectron();
  } catch (error) {
    console.error(error && error.message ? error.message : error);
  } finally {
    rebuilding = false;

    if (pending) {
      pending = false;
      await rebuild();
    }
  }
}

function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => void rebuild(), 120);
}

async function main() {
  await rebuild();

  const watchers = [
    watch(resolve(projectRoot, 'system'), { recursive: true }, schedule),
    watch(resolve(projectRoot, 'ui'), { recursive: true }, schedule),
    watch(resolve(projectRoot, 'main.ts'), schedule),
    watch(resolve(projectRoot, '.electron-kit', 'runtime'), { recursive: true }, schedule),
    watch(resolve(projectRoot, '.electron-kit', 'bridge'), { recursive: true }, schedule),
  ];

  const close = async () => {
    for (const watcher of watchers) watcher.close();
    await stopElectron();
  };

  process.once('SIGINT', async () => {
    await close();
    process.exit(0);
  });

  process.once('SIGTERM', async () => {
    await close();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
