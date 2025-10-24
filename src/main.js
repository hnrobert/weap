const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let allowedWebsites = [];

// 读取配置文件
function loadConfig() {
  const configPath = path.join(__dirname, '../configs/config.json');
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      allowedWebsites = config.allowedWebsites || [];
      console.log('Loaded allowed websites:', allowedWebsites);
    }
  } catch (error) {
    console.error('Error loading config:', error);
    allowedWebsites = [];
  }
}

// 检查 URL 是否在白名单中
function isUrlAllowed(url) {
  if (!url) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // 检查是否匹配任何允许的网站
    return allowedWebsites.some((allowed) => {
      const allowedHostname = new URL(allowed).hostname;
      return (
        hostname === allowedHostname || hostname.endsWith('.' + allowedHostname)
      );
    });
  } catch (error) {
    console.error('Error parsing URL:', error);
    return false;
  }
}

function createWindow() {
  loadConfig();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
  });

  // 设置会话权限请求处理器
  const ses = mainWindow.webContents.session;

  // 拦截所有导航请求
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isUrlAllowed(url)) {
      event.preventDefault();
      console.log('Blocked navigation to:', url);
      mainWindow.webContents.send('navigation-blocked', url);
    }
  });

  // 拦截新窗口
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isUrlAllowed(url)) {
      mainWindow.loadURL(url);
    } else {
      console.log('Blocked opening new window:', url);
      mainWindow.webContents.send('navigation-blocked', url);
    }
    return { action: 'deny' };
  });

  // 拦截网络请求
  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, callback) => {
    const isAllowed = isUrlAllowed(details.url);
    if (!isAllowed) {
      console.log('Blocked request to:', details.url);
    }
    callback({ cancel: !isAllowed });
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC 处理
ipcMain.handle('get-allowed-websites', () => {
  return allowedWebsites;
});

ipcMain.handle('load-url', (event, url) => {
  if (isUrlAllowed(url)) {
    return { success: true };
  } else {
    return { success: false, error: 'URL not in whitelist' };
  }
});

ipcMain.handle('navigate-back', () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
    return true;
  }
  return false;
});

ipcMain.handle('navigate-forward', () => {
  if (mainWindow && mainWindow.webContents.canGoForward()) {
    mainWindow.webContents.goForward();
    return true;
  }
  return false;
});

ipcMain.handle('reload', () => {
  if (mainWindow) {
    mainWindow.webContents.reload();
    return true;
  }
  return false;
});
