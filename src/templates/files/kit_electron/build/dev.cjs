const { spawn, spawnSync } = require('node:child_process');
const { mkdir, rm, writeFile } = require('node:fs/promises');
const { existsSync, watch } = require('node:fs');
const { dirname, resolve } = require('node:path');
const { build } = require('esbuild');
const electron = require('electron');

const projectRoot = resolve(__dirname, '..', '..');
const cache = resolve(projectRoot, 'kit_electron', 'cache');
const uiEntry = existsSync(resolve(projectRoot, 'src', 'ui', 'main.tsx'))
  ? 'src/ui/main.tsx'
  : 'src/ui/main.ts';
const reloadSignal = resolve(cache, 'reload');

let child;
let timer;
let rebuilding = false;
let scheduled = 'ui';
let pending;

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

async function buildRenderer() {
  await build({
    absWorkingDir: projectRoot,
    entryPoints: [uiEntry],
    outfile: resolve(cache, 'browser.js'),
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'es2022',
  });
}

async function compileAll() {
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
      entryPoints: ['kit_electron/bridge/preload.ts'],
      outfile: resolve(cache, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
    }),
    buildRenderer(),
  ]);
}

async function rebuildRenderer() {
  checkTypes();
  await buildRenderer();
  await writeFile(reloadSignal, String(Date.now()));
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
  child = spawn(
    electron,
    [resolve(cache, 'bundle.cjs')],
    {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        KIT_ELECTRON_DEV: '1',
      },
    },
  );
}

function mergeKind(current, next) {
  return current === 'main' || next === 'main' ? 'main' : 'ui';
}

async function rebuild(kind) {
  if (rebuilding) {
    pending = pending ? mergeKind(pending, kind) : kind;
    return;
  }

  rebuilding = true;

  try {
    if (kind === 'ui') {
      await rebuildRenderer();
    } else {
      await stopElectron();
      await compileAll();
      await startElectron();
    }
  } catch (error) {
    console.error(error && error.message ? error.message : error);
  } finally {
    rebuilding = false;

    if (pending) {
      const next = pending;
      pending = undefined;
      await rebuild(next);
    }
  }
}

function schedule(kind) {
  scheduled = mergeKind(scheduled, kind);
  clearTimeout(timer);
  timer = setTimeout(() => {
    const next = scheduled;
    scheduled = 'ui';
    void rebuild(next);
  }, 120);
}

async function main() {
  await rebuild('main');

  const watchers = [
    watch(resolve(projectRoot, 'src', 'ui'), { recursive: true }, () => schedule('ui')),
    watch(resolve(projectRoot, 'src', 'system'), { recursive: true }, () => schedule('main')),
    watch(resolve(projectRoot, 'main.ts'), () => schedule('main')),
    watch(resolve(projectRoot, 'kit_electron', 'runtime'), { recursive: true }, () => schedule('main')),
    watch(resolve(projectRoot, 'kit_electron', 'bridge'), { recursive: true }, () => schedule('main')),
  ];

  const close = async () => {
    clearTimeout(timer);
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
