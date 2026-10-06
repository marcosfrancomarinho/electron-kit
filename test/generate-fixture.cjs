const { rm } = require('node:fs/promises');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');

const name = process.argv[2] ?? 'fixture';
const parent = process.cwd();
const project = resolve(parent, name);
const repository = resolve(__dirname, '..');
const cli = resolve(repository, 'dist', 'bundle.cjs');

async function main() {
  await rm(project, { recursive: true, force: true });

  const child = spawn(process.execPath, [cli], {
    cwd: parent,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  let output = '';
  let errorOutput = '';
  let sentName = false;

  child.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    output += text;
    process.stdout.write(text);

    if (!sentName && output.includes('Enter project name:')) {
      sentName = true;
      child.stdin.write(name + '\n');
      child.stdin.end();
    }
  });

  child.stderr.on('data', (chunk) => {
    const text = chunk.toString();
    errorOutput += text;
    process.stderr.write(text);
  });

  const code = await new Promise((resolveExit, reject) => {
    child.once('error', reject);
    child.once('exit', resolveExit);
  });

  if (code !== 0) {
    throw new Error(
      'Generator exited with code ' +
        code +
        '\n' +
        output +
        '\n' +
        errorOutput,
    );
  }

  console.log('\nFixture created at ' + project);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
