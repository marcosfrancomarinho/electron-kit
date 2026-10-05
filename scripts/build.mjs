import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');

const options = {
  entryPoints: {
    cli: 'src/cli.ts',
    node: 'src/node.ts',
    browser: 'src/browser.ts'
  },
  outdir: 'dist',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  sourcemap: true
};

if (watch) {
  const ctx = await context(options);
  await ctx.watch();
  console.log('electron-kit: watching');
} else {
  await build(options);
}
