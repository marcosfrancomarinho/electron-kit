const { build } = require('electron-builder');
const { buildProject, projectRoot } = require('./build.cjs');

async function packageProject() {
  await buildProject();

  await build({
    projectDir: projectRoot,
    config: {
      directories: {
        output: 'release',
      },
      files: [
        '.electron-kit/dist/**/*',
        'package.json',
      ],
    },
  });

  console.log('✅ Electron package completed');
}

packageProject().catch((error) => {
  console.error('\n❌ Package failed');
  console.error(error && error.message ? error.message : error);
  process.exitCode = 1;
});
