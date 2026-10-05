const { execFileSync } = require('node:child_process');
const { resolve } = require('node:path');
const { build } = require('esbuild');

const projectRoot = resolve(__dirname, '..', '..');

const entries = {
  bundle: resolve(projectRoot, 'src', 'main.ts'),
  node: resolve(projectRoot, 'src', 'node.ts'),
  browser: resolve(projectRoot, 'src', 'browser.ts'),
};

function checkTypes() {
  console.log('\n🔎 TypeScript');

  try {
    const packagePath = require.resolve('typescript/package.json', {
      paths: [projectRoot],
    });
    const { bin } = require(packagePath);
    const compiler = typeof bin === 'string' ? bin : bin?.tsc;
    const tscPath = resolve(require('node:path').dirname(packagePath), compiler);

    execFileSync(process.execPath, [tscPath, '--noEmit'], {
      cwd: projectRoot,
      stdio: 'inherit',
    });
  } catch {
    console.error('\n❌ Build cancelled: TypeScript errors found.');
    return false;
  }

  console.log('✅ No type errors');
  return true;
}

async function emitDeclarations() {
  const packagePath = require.resolve('typescript/package.json', {
    paths: [projectRoot],
  });
  const { bin } = require(packagePath);
  const compiler = typeof bin === 'string' ? bin : bin?.tsc;
  const tscPath = resolve(require('node:path').dirname(packagePath), compiler);

  execFileSync(
    process.execPath,
    [
      tscPath,
      '--declaration',
      '--emitDeclarationOnly',
      '--declarationMap',
      'false',
      '--noEmit',
      'false',
      '--outDir',
      'dist',
    ],
    {
      cwd: projectRoot,
      stdio: 'inherit',
    },
  );
}

const buildOptions = {
  absWorkingDir: projectRoot,
  entryPoints: entries,
  outdir: resolve(projectRoot, 'dist'),
  bundle: true,
  sourcemap: true,
  platform: 'node',
  format: 'esm',
  target: ['node22'],
  packages: 'external',
  logLevel: 'warning',
};

async function runBuild() {
  const startedAt = Date.now();

  if (!checkTypes()) {
    process.exitCode = 1;
    return;
  }

  console.log('\n📦 Build');

  await build(buildOptions);
  await emitDeclarations();

  console.log('✅ Generated files:');
  console.log('   📄 dist/bundle.js');
  console.log('   📄 dist/node.js');
  console.log('   📄 dist/browser.js');
  console.log('\n⚡ Completed in ' + (Date.now() - startedAt) + 'ms');
}

if (require.main === module) {
  runBuild().catch((error) => {
    console.error('\n❌ Build failed');
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
  });
}

module.exports = { buildOptions };
