import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { preloadPath } from '../../electron-kit/runtime/node.js';
import '../providers.js';

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

  await window.loadFile(join(__dirname, 'index.html'));
}

await app.whenReady();
await createWindow();

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    await createWindow();
  }
});
