const { spawnSync } = require('node:child_process');
const { dirname, resolve } = require('node:path');

const projectRoot = resolve(__dirname, '..', '..');

function compileStyles(minify = false) {
  const packagePath = require.resolve('@tailwindcss/cli/package.json', {
    paths: [projectRoot],
  });
  const { bin } = require(packagePath);
  const executable = typeof bin === 'string' ? bin : bin?.tailwindcss;

  if (!executable) {
    throw new Error('The installed Tailwind CSS CLI does not provide a binary.');
  }

  const args = [
    resolve(dirname(packagePath), executable),
    '--input', 'src/ui/style.css',
    '--output', 'kit_electron/cache/style.css',
  ];

  if (minify) args.push('--minify');

  const result = spawnSync(process.execPath, args, {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error('Tailwind CSS compilation failed.');
  }
}

module.exports = { compileStyles };
