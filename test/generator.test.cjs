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
    'src/system/main.ts',
    'index.html',
    'src/ui/style.css',
    'src/ui/main.tsx',
    'src/ui/App.tsx',
    'src/system/providers.ts',
    'kit_electron/build/dev.cjs',
    'kit_electron/build/package.cjs',
    'kit_electron/runtime/preload.ts',
    'kit_electron/runtime/node.ts',
    'kit_electron/runtime/browser.ts',
    'kit_electron/runtime/shared.ts',
    'tsconfig.json',
    'README.md',
  ].map((path) => join(project, path));
}

describe('create-kit-electron', () => {
  it('creates a React project without installing dependencies', async () => {
    const { project } = await generate();

    for (const file of commonFiles(project)) {
      assert.equal(existsSync(file), true, file);
    }

    assert.equal(existsSync(join(project, 'src/ui/main.ts')), false);
    assert.equal(existsSync(join(project, 'src/ui/index.html')), false);
    for (const oldFile of [
      'main.ts',
      'global.d.ts',
      'src/system/functions.ts',
      'src/system/provider.ts',
      'kit_electron/bridge/preload.ts',
      'kit_electron/build/type.cjs',
    ]) {
      assert.equal(existsSync(join(project, oldFile)), false, oldFile);
    }
    assert.equal(existsSync(join(project, 'node_modules')), false);
    assert.equal(existsSync(join(project, 'dist')), false);
    assert.equal(existsSync(join(project, 'release')), false);

    const pkg = await packageJson(project);

    assert.deepEqual(Object.keys(pkg.scripts).sort(), [
      'dev',
      'package',
    ]);
    assert.equal(pkg.dependencies.react.startsWith('^19'), true);
    assert.equal(pkg.dependencies['react-dom'].startsWith('^19'), true);
    assert.equal(pkg.devDependencies['@types/react'].startsWith('^19'), true);
    assert.equal(pkg.devDependencies['@types/react-dom'].startsWith('^19'), true);
    assert.equal(pkg.main, 'kit_electron/cache/bundle.cjs');
  });

  it('generates only the English README and keeps both languages in the repository', async () => {
    const { project } = await generate();
    const generated = await readFile(join(project, 'README.md'), 'utf8');
    const portuguese = await readFile(join(repository, 'README.md'), 'utf8');
    const english = await readFile(join(repository, 'README.en.md'), 'utf8');

    assert.equal(existsSync(join(project, 'README.en.md')), false);
    assert.equal(generated.includes('## Get started'), true);
    assert.equal(generated.includes('## Começar'), false);
    assert.equal(generated.includes('npm run dev'), true);
    assert.equal(generated.includes('npm run package'), true);
    assert.equal(portuguese.includes('[English](README.en.md)'), true);
    assert.equal(english.includes('[Português (Brasil)](README.md)'), true);
  });

  it('keeps application code under src', async () => {
    const { project } = await generate();

    assert.equal(existsSync(join(project, 'src')), true);
    assert.equal(existsSync(join(project, 'src/ui')), true);
    assert.equal(existsSync(join(project, 'src/system')), true);
    assert.equal(existsSync(join(project, 'ui')), false);
    assert.equal(existsSync(join(project, 'system')), false);
  });
  it('checks types in dev and package without a separate command', async () => {
    const { project } = await generate();
    const dev = await readFile(join(project, 'kit_electron/build/dev.cjs'), 'utf8');
    const pack = await readFile(join(project, 'kit_electron/build/package.cjs'), 'utf8');
    const browser = await readFile(join(project, 'kit_electron/runtime/browser.ts'), 'utf8');
    const providers = await readFile(join(project, 'src/system/providers.ts'), 'utf8');
    const main = await readFile(join(project, 'src/system/main.ts'), 'utf8');

    for (const script of [dev, pack]) {
      assert.equal(script.includes('checkTypes();'), true);
      assert.equal(script.includes("entryPoints: ['src/system/main.ts']"), true);
      assert.equal(script.includes("entryPoints: ['kit_electron/runtime/preload.ts']"), true);
    }

    assert.equal(browser.includes('../../src/system/providers.js'), true);
    assert.equal(main.includes("import './providers.js'"), true);
    assert.equal(main.includes("join(__dirname, '..', '..', 'index.html')"), true);
    const html = await readFile(join(project, 'index.html'), 'utf8');
    assert.equal(html.includes('./kit_electron/cache/browser.js'), true);
    assert.equal(html.includes('./kit_electron/cache/style.css'), true);
    assert.equal(dev.includes("watch(resolve(projectRoot, 'index.html')"), true);
    assert.equal(dev.includes("buildStyles();"), true);
    assert.equal(pack.includes("'kit_electron/cache/style.css'"), true);
    assert.equal(providers.includes(".register('version'"), true);
    assert.equal(dev.includes("watch(resolve(projectRoot, 'main.ts')"), false);
    assert.equal(dev.includes("'bridge'"), false);
  });

  it('reloads UI changes without restarting Electron', async () => {
    const { project } = await generate();
    const dev = await readFile(
      join(project, 'kit_electron/build/dev.cjs'),
      'utf8',
    );
    const runtime = await readFile(
      join(project, 'kit_electron/runtime/node.ts'),
      'utf8',
    );
    const main = await readFile(join(project, 'src/system/main.ts'), 'utf8');

    const rendererStart = dev.indexOf('async function rebuildRenderer()');
    const rendererEnd = dev.indexOf('async function stopElectron()');
    const rendererSection = dev.slice(rendererStart, rendererEnd);

    assert.notEqual(rendererStart, -1);
    assert.notEqual(rendererEnd, -1);
    assert.equal(rendererSection.includes('startElectron'), false);
    assert.equal(rendererSection.includes('writeFile(reloadSignal'), true);
    assert.equal(dev.includes("schedule('ui')"), true);
    assert.equal(dev.includes("schedule('main')"), true);
    assert.equal(runtime.includes('reloadRendererOnChange'), true);
    assert.equal(runtime.includes('window.webContents.reload()'), true);
    assert.equal(main.includes('reloadRendererOnChange(window)'), true);
  });

});
