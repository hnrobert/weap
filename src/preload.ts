import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取配置
  getConfig: () => ipcRenderer.invoke('get-app-config'),
  getAllowedWebsites: () => ipcRenderer.invoke('get-allowed-websites'),

  // 导航控制
  onNavigateTo: (callback: (url: string) => void) => {
    ipcRenderer.on('navigate-to', (_event, url: string) => callback(url));
  },

  onNewTab: (callback: () => void) => {
    ipcRenderer.on('new-tab', () => callback());
  },

  onCloseTab: (callback: () => void) => {
    ipcRenderer.on('close-tab', () => callback());
  },

  onGoBack: (callback: () => void) => {
    ipcRenderer.on('go-back', () => callback());
  },

  onGoForward: (callback: () => void) => {
    ipcRenderer.on('go-forward', () => callback());
  },

  onReload: (callback: () => void) => {
    ipcRenderer.on('reload', () => callback());
  },

  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// 类型定义
declare global {
  interface Window {
    electronAPI: {
      getConfig: () => Promise<any>;
      getAllowedWebsites: () => Promise<string[]>;
      onNavigateTo: (callback: (url: string) => void) => void;
      onNewTab: (callback: () => void) => void;
      onCloseTab: (callback: () => void) => void;
      onGoBack: (callback: () => void) => void;
      onGoForward: (callback: () => void) => void;
      onReload: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
