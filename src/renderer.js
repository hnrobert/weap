let allowedWebsites = [];
let currentWebview = null;

// 初始化
async function init() {
  allowedWebsites = await window.electronAPI.getAllowedWebsites();
  console.log('Allowed websites:', allowedWebsites);

  renderWebsiteTabs();
  setupEventListeners();

  // 加载第一个网站
  if (allowedWebsites.length > 0) {
    loadWebsite(allowedWebsites[0]);
  }
}

// 渲染网站标签
function renderWebsiteTabs() {
  const tabsContainer = document.getElementById('website-tabs');
  tabsContainer.innerHTML = '';

  allowedWebsites.forEach((website, index) => {
    const tab = document.createElement('button');
    tab.className = 'website-tab';
    tab.textContent = extractDomain(website);
    tab.onclick = () => loadWebsite(website);
    if (index === 0) {
      tab.classList.add('active');
    }
    tabsContainer.appendChild(tab);
  });
}

// 提取域名
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (error) {
    return url;
  }
}

// 加载网站
function loadWebsite(url) {
  const webview = document.getElementById('webview');
  const urlInput = document.getElementById('url-input');

  // 确保 URL 有协议
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  webview.src = url;
  urlInput.value = url;

  // 更新标签状态
  const tabs = document.querySelectorAll('.website-tab');
  tabs.forEach((tab) => {
    if (
      extractDomain(url).includes(tab.textContent) ||
      tab.textContent.includes(extractDomain(url))
    ) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

// 显示通知
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// 设置事件监听器
function setupEventListeners() {
  const webview = document.getElementById('webview');
  const urlInput = document.getElementById('url-input');
  const goBtn = document.getElementById('go-btn');
  const backBtn = document.getElementById('back-btn');
  const forwardBtn = document.getElementById('forward-btn');
  const reloadBtn = document.getElementById('reload-btn');

  // 前往按钮
  goBtn.onclick = async () => {
    const url = urlInput.value.trim();
    if (url) {
      const result = await window.electronAPI.loadUrl(url);
      if (result.success) {
        loadWebsite(url);
      } else {
        showNotification('该网址不在白名单中！');
      }
    }
  };

  // 回车键
  urlInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      goBtn.click();
    }
  };

  // 后退
  backBtn.onclick = async () => {
    await window.electronAPI.navigateBack();
  };

  // 前进
  forwardBtn.onclick = async () => {
    await window.electronAPI.navigateForward();
  };

  // 刷新
  reloadBtn.onclick = async () => {
    await window.electronAPI.reload();
  };

  // Webview 事件
  webview.addEventListener('did-start-loading', () => {
    console.log('Loading...');
  });

  webview.addEventListener('did-stop-loading', () => {
    console.log('Loaded');
    urlInput.value = webview.getURL();
  });

  webview.addEventListener('did-fail-load', (event) => {
    console.error('Failed to load:', event);
    if (event.errorCode !== -3) {
      // -3 是用户取消
      showNotification('页面加载失败！');
    }
  });

  // 监听被阻止的导航
  window.electronAPI.onNavigationBlocked((url) => {
    showNotification(`访问被阻止: ${url}`);
  });
}

// 启动应用
init();
