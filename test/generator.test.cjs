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

async function generate(template) {
  const parent = await mkdtemp(join(tmpdir(), 'create-kit-electron-'));
  const name = 'app-' + template;
  const project = join(parent, name);
  fixtures.push(parent);

  const child = spawn(process.execPath, [cli], {
    cwd: parent,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let output = '';
  let errorOutput = '';
  let sentName = false;
  let sentTemplate = false;

  child.stdout.on('data', (chunk) => {
    output += chunk.toString();

    if (!sentName && output.includes('Enter project name:')) {
      sentName = true;
      child.stdin.write(name + '\n');
    }

    if (
      sentName &&
      !sentTemplate &&
      output.includes('Select template: [vanilla/react]:')
    ) {
      sentTemplate = true;
      child.stdin.write(template + '\n');
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
    'src/system/functions.ts',
    'src/system/provider.ts',
    'electron_kit/build/dev.cjs',
    'electron_kit/build/package.cjs',
    'electron_kit/build/type.cjs',
    'electron_kit/bridge/preload.ts',
    'electron_kit/runtime/node.ts',
    'electron_kit/runtime/browser.ts',
    'electron_kit/runtime/shared.ts',
    'tsconfig.json',
  ].map((path) => join(project, path));
}

describe('create-kit-electron', () => {
  it('creates the minimal Vanilla template without installing dependencies', async () => {
    const { project } = await generate('vanilla');

    for (const file of commonFiles(project)) {
      assert.equal(existsSync(file), true, file);
    }

    assert.equal(existsSync(join(project, 'src/ui/main.ts')), true);
    assert.equal(existsSync(join(project, 'src/ui/main.tsx')), false);
    assert.equal(existsSync(join(project, 'src/ui/App.tsx')), false);
    assert.equal(existsSync(join(project, 'node_modules')), false);
    assert.equal(existsSync(join(project, 'dist')), false);
    assert.equal(existsSync(join(project, 'release')), false);

    const pkg = await packageJson(project);

    assert.deepEqual(Object.keys(pkg.scripts).sort(), [
      'dev',
      'package',
      'type',
    ]);
    assert.deepEqual(pkg.dependencies, {});
    assert.equal(pkg.main, 'electron_kit/cache/bundle.cjs');
  });

  it('creates the React template with TSX and React dependencies', async () => {
    const { project } = await generate('react');

    for (const file of commonFiles(project)) {
      assert.equal(existsSync(file), true, file);
    }

    assert.equal(existsSync(join(project, 'src/ui/main.ts')), false);
    assert.equal(existsSync(join(project, 'src/ui/main.tsx')), true);
    assert.equal(existsSync(join(project, 'src/ui/App.tsx')), true);
    assert.equal(existsSync(join(project, 'node_modules')), false);

    const pkg = await packageJson(project);

    assert.equal(pkg.dependencies.react.startsWith('^19'), true);
    assert.equal(pkg.dependencies['react-dom'].startsWith('^19'), true);
    assert.equal(pkg.devDependencies['@types/react'].startsWith('^19'), true);
    assert.equal(pkg.devDependencies['@types/react-dom'].startsWith('^19'), true);
  });

  it('keeps application code under src', async () => {
    const { project } = await generate('vanilla');

    assert.equal(existsSync(join(project, 'src')), true);
    assert.equal(existsSync(join(project, 'src/ui')), true);
    assert.equal(existsSync(join(project, 'src/system')), true);
    assert.equal(existsSync(join(project, 'ui')), false);
    assert.equal(existsSync(join(project, 'system')), false);
  });
});
