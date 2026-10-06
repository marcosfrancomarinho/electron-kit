const { spawnSync } = require('node:child_process');
const { cp, mkdir, rm } = require('node:fs/promises');
const { resolve } = require('node:path');
const { build } = require('esbuild');

const projectRoot = resolve(__dirname, '..', '..');
const dist = resolve(projectRoot, '.electron-kit', 'dist');

function checkTypes() {
  const result = spawnSync(
    process.execPath,
    [resolve(__dirname, 'type.cjs')],
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

async function buildProject() {
  checkTypes();

  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });

  await Promise.all([
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['src/node/main.ts'],
      outfile: resolve(dist, 'main.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
      sourcemap: true,
    }),
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['electron-kit/bridge/preload.ts'],
      outfile: resolve(dist, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
      sourcemap: true,
    }),
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['src/browser/main.ts'],
      outfile: resolve(dist, 'browser.js'),
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
      sourcemap: true,
    }),
  ]);

  await cp(
    resolve(projectRoot, 'src', 'browser', 'index.html'),
    resolve(dist, 'index.html'),
  );

  console.log('✅ Electron build completed');
}

if (require.main === module) {
  buildProject().catch((error) => {
    console.error('\n❌ Build failed');
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = { buildProject, dist, projectRoot };
