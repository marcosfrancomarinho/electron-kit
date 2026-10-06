import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('__createKitElectron', {
  invoke(token: string, method: string | null, args: unknown[]) {
    return ipcRenderer.invoke(
      'create-kit-electron:invoke',
      token,
      method,
      args,
    );
  },
});
