import { app, BrowserWindow, Menu, ipcMain, shell, session } from 'electron';
import * as path from 'path';
import Store from 'electron-store';

interface AppConfig {
  allowedWebsites: string[];
  appName: string;
}

class WeapApp {
  private mainWindow: BrowserWindow | null = null;
  private store: Store;
  private config: AppConfig;

  constructor() {
    this.store = new Store();
    this.config = this.loadConfig();
    this.setupApp();
  }

  private loadConfig(): AppConfig {
    // 从环境变量或构建时配置加载允许的网站
    const websites =
      process.env.ALLOWED_WEBSITES || 'https://google.com,https://github.com';
    const allowedWebsites = websites.split(',').map((site) => site.trim());

    return {
      allowedWebsites,
      appName: process.env.APP_NAME || 'WEAP Browser',
    };
  }

  private setupApp(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupSecurity();
      this.setupMenu();
      this.setupIPC();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
      titleBarStyle: 'hiddenInset',
      title: this.config.appName,
    });

    this.mainWindow.loadFile(path.join(__dirname, '../assets/index.html'));

    if (process.argv.includes('--dev')) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  private setupSecurity(): void {
    // 设置内容安全策略
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      const url = new URL(details.url);
      const isAllowed = this.config.allowedWebsites.some((allowedSite) => {
        const allowedUrl = new URL(allowedSite);
        return (
          url.hostname === allowedUrl.hostname ||
          url.hostname.endsWith('.' + allowedUrl.hostname)
        );
      });

      // 允许本地资源和允许的网站
      if (
        url.protocol === 'file:' ||
        url.protocol === 'chrome-extension:' ||
        isAllowed
      ) {
        callback({ cancel: false });
      } else {
        console.log(`Blocked request to: ${details.url}`);
        callback({ cancel: true });
      }
    });

    // 阻止新窗口打开
    app.on('web-contents-created', (_event, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        // 检查URL是否在白名单中
        const parsedUrl = new URL(url);
        const isAllowed = this.config.allowedWebsites.some((allowedSite) => {
          const allowedUrl = new URL(allowedSite);
          return (
            parsedUrl.hostname === allowedUrl.hostname ||
            parsedUrl.hostname.endsWith('.' + allowedUrl.hostname)
          );
        });

        if (isAllowed) {
          // 在同一窗口中打开链接
          if (this.mainWindow) {
            this.mainWindow.webContents.send('navigate-to', url);
          }
        } else {
          console.log(`Blocked external link: ${url}`);
        }
        return { action: 'deny' };
      });
    });
  }

  private setupMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'New Tab',
            accelerator: 'CmdOrCtrl+T',
            click: () => {
              this.mainWindow?.webContents.send('new-tab');
            },
          },
          {
            label: 'Close Tab',
            accelerator: 'CmdOrCtrl+W',
            click: () => {
              this.mainWindow?.webContents.send('close-tab');
            },
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Navigation',
        submenu: [
          {
            label: 'Back',
            accelerator: 'CmdOrCtrl+Left',
            click: () => {
              this.mainWindow?.webContents.send('go-back');
            },
          },
          {
            label: 'Forward',
            accelerator: 'CmdOrCtrl+Right',
            click: () => {
              this.mainWindow?.webContents.send('go-forward');
            },
          },
          {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: () => {
              this.mainWindow?.webContents.send('reload');
            },
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Toggle Developer Tools',
            accelerator:
              process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
            click: () => {
              this.mainWindow?.webContents.toggleDevTools();
            },
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupIPC(): void {
    ipcMain.handle('get-allowed-websites', () => {
      return this.config.allowedWebsites;
    });

    ipcMain.handle('get-app-config', () => {
      return this.config;
    });
  }
}

// 启动应用
new WeapApp();
