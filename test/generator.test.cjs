const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { spawn } = require('node:child_process');
const { after, describe, it } = require('node:test');

const repository = resolve(__dirname, '..');
const cli = resolve(repository, 'dist', 'bundle.cjs');
const fixtures = [];

after(async () => {
  await Promise.all(
    fixtures.map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function generate() {
  const parent = await mkdtemp(join(tmpdir(), 'create-kit-electron-'));
  const name = 'app-react';
  const project = join(parent, name);
  fixtures.push(parent);

  const child = spawn(process.execPath, [cli], {
    cwd: parent,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let output = '';
  let errorOutput = '';
  let sentName = false;

  child.stdout.on('data', (chunk) => {
    output += chunk.toString();

    if (!sentName && output.includes('Enter project name:')) {
      sentName = true;
      child.stdin.write(name + '\n');
      child.stdin.end();
    }
  });

  child.stderr.on('data', (chunk) => {
    errorOutput += chunk.toString();
  });

  const code = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', resolveExit);
  });

  assert.equal(
    code,
    0,
    'generator failed:\n' + output + '\n' + errorOutput,
  );

  return { project, output };
}

async function packageJson(project) {
  return JSON.parse(
    await readFile(join(project, 'package.json'), 'utf8'),
  );
}

function commonFiles(project) {
  return [
    'main.ts',
    'global.d.ts',
    'src/ui/index.html',
    'src/ui/style.css',
    'src/ui/main.tsx',
    'src/ui/App.tsx',
    'src/system/functions.ts',
    'src/system/provider.ts',
    'kit_electron/build/dev.cjs',
    'kit_electron/build/package.cjs',
    'kit_electron/build/type.cjs',
    'kit_electron/bridge/preload.ts',
    'kit_electron/runtime/node.ts',
    'kit_electron/runtime/browser.ts',
    'kit_electron/runtime/shared.ts',
    'tsconfig.json',
  ].map((path) => join(project, path));
}

describe('create-kit-electron', () => {
  it('creates a React project without installing dependencies', async () => {
    const { project } = await generate();

    for (const file of commonFiles(project)) {
      assert.equal(existsSync(file), true, file);
    }

    assert.equal(existsSync(join(project, 'src/ui/main.ts')), false);
    assert.equal(existsSync(join(project, 'node_modules')), false);
    assert.equal(existsSync(join(project, 'dist')), false);
    assert.equal(existsSync(join(project, 'release')), false);

    const pkg = await packageJson(project);

    assert.deepEqual(Object.keys(pkg.scripts).sort(), [
      'dev',
      'package',
      'type',
    ]);
    assert.equal(pkg.dependencies.react.startsWith('^19'), true);
    assert.equal(pkg.dependencies['react-dom'].startsWith('^19'), true);
    assert.equal(pkg.devDependencies['@types/react'].startsWith('^19'), true);
    assert.equal(pkg.devDependencies['@types/react-dom'].startsWith('^19'), true);
    assert.equal(pkg.main, 'kit_electron/cache/bundle.cjs');
  });

  it('keeps application code under src', async () => {
    const { project } = await generate();

    assert.equal(existsSync(join(project, 'src')), true);
    assert.equal(existsSync(join(project, 'src/ui')), true);
    assert.equal(existsSync(join(project, 'src/system')), true);
    assert.equal(existsSync(join(project, 'ui')), false);
    assert.equal(existsSync(join(project, 'system')), false);
  });
});
