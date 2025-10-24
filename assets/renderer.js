class WeapBrowser {
  constructor() {
    this.tabs = [];
    this.activeTabId = null;
    this.tabCounter = 0;
    this.allowedWebsites = [];

    this.init();
  }

  async init() {
    try {
      // 获取允许的网站列表
      this.allowedWebsites = await window.electronAPI.getAllowedWebsites();

      // 初始化UI
      this.initializeUI();
      this.setupEventListeners();

      // 创建第一个标签
      this.createNewTab();
    } catch (error) {
      console.error('Failed to initialize browser:', error);
    }
  }

  initializeUI() {
    // 填充网站选择器
    const websiteSelect = document.getElementById('website-select');
    websiteSelect.innerHTML = '';

    this.allowedWebsites.forEach((website) => {
      const option = document.createElement('option');
      option.value = website;
      option.textContent = new URL(website).hostname;
      websiteSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // 新建标签按钮
    document.getElementById('new-tab-btn').addEventListener('click', () => {
      this.createNewTab();
    });

    // 导航按钮
    document.getElementById('back-btn').addEventListener('click', () => {
      this.goBack();
    });

    document.getElementById('forward-btn').addEventListener('click', () => {
      this.goForward();
    });

    document.getElementById('reload-btn').addEventListener('click', () => {
      this.reload();
    });

    // Go按钮
    document.getElementById('go-btn').addEventListener('click', () => {
      this.navigateToSelected();
    });

    // 网站选择器变化
    document.getElementById('website-select').addEventListener('change', () => {
      this.navigateToSelected();
    });

    // Electron IPC事件监听
    window.electronAPI.onNewTab(() => {
      this.createNewTab();
    });

    window.electronAPI.onCloseTab(() => {
      this.closeActiveTab();
    });

    window.electronAPI.onGoBack(() => {
      this.goBack();
    });

    window.electronAPI.onGoForward(() => {
      this.goForward();
    });

    window.electronAPI.onReload(() => {
      this.reload();
    });

    window.electronAPI.onNavigateTo((url) => {
      this.navigateActiveTab(url);
    });
  }

  createNewTab() {
    const tabId = `tab-${++this.tabCounter}`;
    const defaultUrl = this.allowedWebsites[0] || 'about:blank';

    const tab = {
      id: tabId,
      title: 'New Tab',
      url: defaultUrl,
      canGoBack: false,
      canGoForward: false,
      isLoading: false,
    };

    this.tabs.push(tab);
    this.createTabElement(tab);
    this.createWebviewElement(tab);
    this.switchToTab(tabId);

    // 导航到默认网站
    if (defaultUrl !== 'about:blank') {
      this.navigateTab(tabId, defaultUrl);
    }
  }

  createTabElement(tab) {
    const tabsContainer = document.getElementById('tabs-container');

    const tabElement = document.createElement('div');
    tabElement.className = 'tab';
    tabElement.dataset.tabId = tab.id;

    const tabTitle = document.createElement('span');
    tabTitle.className = 'tab-title';
    tabTitle.textContent = tab.title;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'tab-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeTab(tab.id);
    });

    tabElement.appendChild(tabTitle);
    tabElement.appendChild(closeBtn);

    tabElement.addEventListener('click', () => {
      this.switchToTab(tab.id);
    });

    tabsContainer.appendChild(tabElement);
  }

  createWebviewElement(tab) {
    const container = document.getElementById('webview-container');

    const webview = document.createElement('webview');
    webview.className = 'webview hidden';
    webview.dataset.tabId = tab.id;
    webview.src = tab.url;
    webview.allowpopups = false;

    // 监听webview事件
    webview.addEventListener('dom-ready', () => {
      this.updateTabLoading(tab.id, false);
    });

    webview.addEventListener('did-start-loading', () => {
      this.updateTabLoading(tab.id, true);
    });

    webview.addEventListener('did-stop-loading', () => {
      this.updateTabLoading(tab.id, false);
    });

    webview.addEventListener('page-title-updated', (e) => {
      this.updateTabTitle(tab.id, e.title);
    });

    webview.addEventListener('did-navigate', (e) => {
      this.updateTabUrl(tab.id, e.url);
    });

    webview.addEventListener('did-navigate-in-page', (e) => {
      this.updateTabUrl(tab.id, e.url);
    });

    container.appendChild(webview);
  }

  switchToTab(tabId) {
    // 更新活动标签
    this.activeTabId = tabId;

    // 更新标签样式
    document.querySelectorAll('.tab').forEach((tab) => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab-id="${tabId}"]`).classList.add('active');

    // 显示对应的webview
    document.querySelectorAll('.webview').forEach((webview) => {
      webview.classList.add('hidden');
    });
    const activeWebview = document.querySelector(
      `webview[data-tab-id="${tabId}"]`
    );
    if (activeWebview) {
      activeWebview.classList.remove('hidden');
    }

    // 更新导航按钮状态
    this.updateNavigationButtons();
  }

  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex === -1) return;

    // 移除标签数据
    this.tabs.splice(tabIndex, 1);

    // 移除DOM元素
    const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
    const webviewElement = document.querySelector(
      `webview[data-tab-id="${tabId}"]`
    );

    if (tabElement) tabElement.remove();
    if (webviewElement) webviewElement.remove();

    // 如果关闭的是活动标签，切换到其他标签
    if (this.activeTabId === tabId) {
      if (this.tabs.length > 0) {
        const newActiveTab = this.tabs[Math.max(0, tabIndex - 1)];
        this.switchToTab(newActiveTab.id);
      } else {
        this.activeTabId = null;
      }
    }

    // 如果没有标签了，创建一个新的
    if (this.tabs.length === 0) {
      this.createNewTab();
    }
  }

  closeActiveTab() {
    if (this.activeTabId) {
      this.closeTab(this.activeTabId);
    }
  }

  navigateToSelected() {
    const websiteSelect = document.getElementById('website-select');
    const selectedUrl = websiteSelect.value;

    if (selectedUrl && this.activeTabId) {
      this.navigateTab(this.activeTabId, selectedUrl);
    }
  }

  navigateTab(tabId, url) {
    const webview = document.querySelector(`webview[data-tab-id="${tabId}"]`);
    if (webview) {
      webview.src = url;
    }
  }

  navigateActiveTab(url) {
    if (this.activeTabId) {
      this.navigateTab(this.activeTabId, url);
    }
  }

  goBack() {
    const webview = document.querySelector(
      `webview[data-tab-id="${this.activeTabId}"]`
    );
    if (webview && webview.canGoBack()) {
      webview.goBack();
    }
  }

  goForward() {
    const webview = document.querySelector(
      `webview[data-tab-id="${this.activeTabId}"]`
    );
    if (webview && webview.canGoForward()) {
      webview.goForward();
    }
  }

  reload() {
    const webview = document.querySelector(
      `webview[data-tab-id="${this.activeTabId}"]`
    );
    if (webview) {
      webview.reload();
    }
  }

  updateTabTitle(tabId, title) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.title = title;
      const tabElement = document.querySelector(
        `[data-tab-id="${tabId}"] .tab-title`
      );
      if (tabElement) {
        tabElement.textContent = title;
      }
    }
  }

  updateTabUrl(tabId, url) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.url = url;
    }
    this.updateNavigationButtons();
  }

  updateTabLoading(tabId, isLoading) {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab) {
      tab.isLoading = isLoading;
    }
  }

  updateNavigationButtons() {
    if (!this.activeTabId) return;

    const webview = document.querySelector(
      `webview[data-tab-id="${this.activeTabId}"]`
    );
    if (!webview) return;

    const backBtn = document.getElementById('back-btn');
    const forwardBtn = document.getElementById('forward-btn');

    backBtn.disabled = !webview.canGoBack();
    forwardBtn.disabled = !webview.canGoForward();
  }
}

// 等待DOM加载完成后初始化浏览器
document.addEventListener('DOMContentLoaded', () => {
  new WeapBrowser();
});
