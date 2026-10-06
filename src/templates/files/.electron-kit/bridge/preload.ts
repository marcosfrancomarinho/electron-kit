import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('__electronKit', {
  invoke(token: string, method: string | null, args: unknown[]) {
    return ipcRenderer.invoke(
      'electron-kit:invoke',
      token,
      method,
      args,
    );
  },
});
