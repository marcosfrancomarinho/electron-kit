const { spawnSync } = require('node:child_process');
const { mkdir, rm } = require('node:fs/promises');
const { resolve } = require('node:path');
const { build } = require('esbuild');

const projectRoot = resolve(__dirname, '..', '..');
const dist = resolve(projectRoot, 'dist');
const cache = resolve(projectRoot, 'electron-kit', 'cache');

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
  await rm(cache, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await mkdir(cache, { recursive: true });

  await Promise.all([
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['node/main.ts'],
      outfile: resolve(dist, 'bundle.cjs'),
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
      outfile: resolve(cache, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      target: 'node22',
      external: ['electron'],
      sourcemap: true,
    }),
    build({
      absWorkingDir: projectRoot,
      entryPoints: ['browser/main.ts'],
      outfile: resolve(cache, 'browser.js'),
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es2022',
      sourcemap: true,
    }),
  ]);

  console.log('✅ dist/bundle.cjs generated');
}

if (require.main === module) {
  buildProject().catch((error) => {
    console.error('\n❌ Build failed');
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = {
  buildProject,
  cache,
  dist,
  projectRoot,
};
