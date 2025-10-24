const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAllowedWebsites: () => ipcRenderer.invoke('get-allowed-websites'),
  loadUrl: (url) => ipcRenderer.invoke('load-url', url),
  navigateBack: () => ipcRenderer.invoke('navigate-back'),
  navigateForward: () => ipcRenderer.invoke('navigate-forward'),
  reload: () => ipcRenderer.invoke('reload'),
  onNavigationBlocked: (callback) =>
    ipcRenderer.on('navigation-blocked', (event, url) => callback(url)),
});
