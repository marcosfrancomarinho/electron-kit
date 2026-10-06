const { spawnSync } = require('node:child_process');
const { dirname, resolve } = require('node:path');

const projectRoot = resolve(__dirname, '..', '..');

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

function main() {
  const result = spawnSync(
    process.execPath,
    [compilerPath(), '--noEmit'],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  );

  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

try {
  main();
} catch (error) {
  console.error('\n❌ TypeScript check failed');
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
}
