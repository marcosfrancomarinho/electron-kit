const { spawn } = require('node:child_process');
const { watch } = require('node:fs');
const { resolve } = require('node:path');
const electron = require('electron');
const { buildProject, dist, projectRoot } = require('./build.cjs');

let child;
let timer;
let rebuilding = false;
let pending = false;

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
    [resolve(dist, 'bundle.cjs')],
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
    await buildProject();
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
    watch(resolve(projectRoot, 'node'), { recursive: true }, schedule),
    watch(resolve(projectRoot, 'main.ts'), schedule),
    watch(resolve(projectRoot, 'browser'), { recursive: true }, schedule),
    watch(resolve(projectRoot, 'provider'), { recursive: true }, schedule),
    watch(resolve(projectRoot, 'index.html'), schedule),
    watch(resolve(projectRoot, 'style.css'), schedule),
    watch(resolve(projectRoot, 'electron-kit', 'runtime'), { recursive: true }, schedule),
    watch(resolve(projectRoot, 'electron-kit', 'bridge'), { recursive: true }, schedule),
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
