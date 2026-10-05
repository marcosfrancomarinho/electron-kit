const { execFileSync } = require('node:child_process');
const { dirname, resolve } = require('node:path');
const { build } = require('esbuild');

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

function checkTypes() {
  console.log('\n🔎 TypeScript');

  try {
    execFileSync(process.execPath, [compilerPath(), '--noEmit'], {
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

const buildOptions = {
  absWorkingDir: projectRoot,
  entryPoints: [resolve(projectRoot, 'src', 'main.ts')],
  bundle: true,
  outfile: resolve(projectRoot, 'dist', 'bundle.cjs'),
  sourcemap: true,
  platform: 'node',
  format: 'cjs',
  target: ['node22'],
  packages: 'bundle',
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

  console.log('✅ Generated files:');
  console.log('   📄 dist/bundle.cjs');
  console.log('   🗺️  dist/bundle.cjs.map');
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
