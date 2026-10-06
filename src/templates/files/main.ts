import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { preloadPath } from './_electron_kit/runtime/node.js';
import './src/system/provider.js';

async function createWindow() {
  const window = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: preloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  await window.loadFile(
    join(__dirname, '..', '..', 'src', 'ui', 'index.html'),
  );
}

app.whenReady().then(async () => {
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
