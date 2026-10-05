const { spawn } = require('node:child_process');
const { resolve } = require('node:path');
const { build, context } = require('esbuild');
const { buildOptions } = require('./esbuild.config.cjs');

const projectRoot = resolve(__dirname, '..', '..');
const outputFile = resolve(__dirname, '.cache', 'dev-bundle.cjs');
let child;
let buildContext;
let restartPending = false;
let restartTask;
let shuttingDown = false;
let initialBuild = true;

function waitForExit(processToStop) {
  if (
    !processToStop ||
    processToStop.exitCode !== null ||
    processToStop.signalCode !== null
  ) {
    return Promise.resolve(processToStop?.exitCode ?? 0);
  }

  return new Promise((resolveExit) => {
    processToStop.once('exit', (code) => resolveExit(code ?? 0));
    processToStop.kill('SIGTERM');
  });
}

function startChild() {
  const nextChild = spawn(process.execPath, ['--enable-source-maps', outputFile], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  child = nextChild;
  nextChild.once('exit', () => {
    if (child === nextChild) child = undefined;
  });
}

async function stopChild() {
  const processToStop = child;
  child = undefined;
  await waitForExit(processToStop);
}

async function restartChild() {
  await stopChild();
  if (!shuttingDown) startChild();
}

function queueRestart() {
  restartPending = true;

  if (!restartTask) {
    restartTask = (async () => {
      while (restartPending && !shuttingDown) {
        restartPending = false;
        await restartChild();
      }
    })().finally(() => {
      restartTask = undefined;
    });
  }

  return restartTask;
}

const restartPlugin = {
  name: 'electron-kit-generator-restart',
  setup(esbuild) {
    esbuild.onStart(() => {
      if (initialBuild) {
        initialBuild = false;
        return;
      }

      if (process.stdout.isTTY) console.clear();
    });

    esbuild.onEnd((result) => {
      if (result.errors.length > 0) return;
      return queueRestart();
    });
  },
};

async function runOnce() {
  await build({
    ...buildOptions,
    outfile: outputFile,
    sourcemap: 'inline',
  });

  startChild();
}

async function runWatch() {
  buildContext = await context({
    ...buildOptions,
    outfile: outputFile,
    sourcemap: 'inline',
    plugins: [restartPlugin],
  });

  await buildContext.watch();
  console.log('Electron Kit generator: watching for changes...');
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  restartPending = false;
  if (restartTask) await restartTask;
  await stopChild();
  if (buildContext) await buildContext.dispose();
}

async function run() {
  const watchMode =
    process.argv.slice(2).includes('--watch') ||
    process.env.npm_config_watch === 'true';

  if (watchMode) {
    await runWatch();
    return;
  }

  await runOnce();
}

async function handleSignal() {
  await shutdown();
  process.exit(0);
}

process.once('SIGINT', handleSignal);
process.once('SIGTERM', handleSignal);

run().catch(async (error) => {
  console.error(error);
  await shutdown();
  process.exitCode = 1;
});
