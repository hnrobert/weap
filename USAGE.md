# 使用指南

## 快速开始

### 1. 本地测试

首先安装依赖：

```bash
npm install
```

修改 `configs/config.json` 添加你想访问的网站：

```json
{
  "allowedWebsites": [
    "https://github.com",
    "https://www.google.com",
    "https://stackoverflow.com"
  ]
}
```

启动应用：

```bash
npm start
```

### 2. 使用 GitHub Actions 自动构建

#### 步骤：

1. **推送代码到 GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **触发工作流**
   - 访问你的 GitHub 仓库
   - 点击顶部的 **Actions** 标签
   - 在左侧选择 **Build Electron App**
   - 点击右侧的 **Run workflow** 按钮
3. **输入网站列表**
   在弹出的对话框中输入允许访问的网站，例如：
   ```
   https://github.com,https://www.google.com,https://stackoverflow.com
   ```
4. **开始构建**
   点击绿色的 **Run workflow** 按钮开始构建

5. **下载构建产物**
   - 构建完成后（大约 10-20 分钟）
   - 进入 **Releases** 页面
   - 下载对应平台的安装包

## 应用功能说明

### 界面布局

```
┌─────────────────────────────────────────────────┐
│ [←] [→] [⟳]  │  [网站1] [网站2] [网站3]       │
│ [________________网址栏________________] [前往]  │
├─────────────────────────────────────────────────┤
│                                                 │
│                                                 │
│              网页内容显示区域                    │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 功能按钮

- **← (后退)**: 返回上一页
- **→ (前进)**: 前进到下一页
- **⟳ (刷新)**: 刷新当前页面
- **网站标签**: 点击快速切换到对应网站
- **网址栏**: 手动输入网址（必须在白名单中）
- **前往按钮**: 访问输入的网址

### 安全特性

1. **白名单控制**: 只能访问预定义的网站
2. **导航拦截**: 尝试访问非白名单网站会被阻止
3. **弹窗拦截**: 阻止打开新窗口或标签页
4. **请求过滤**: 网络请求也会被过滤

## 构建平台详情

### macOS 构建产物

- **DMG**: 用于分发的磁盘镜像（推荐）
- **ZIP**: 压缩包格式

架构：

- `x64`: Intel Mac
- `arm64`: Apple Silicon (M1/M2/M3)
- `universal`: 通用版本（同时支持 Intel 和 Apple Silicon）

### Windows 构建产物

- **NSIS 安装程序**: `.exe` 安装文件（推荐）
- **ZIP**: 便携版压缩包

架构：

- `x64`: 64 位 Windows
- `ia32`: 32 位 Windows
- `arm64`: ARM64 Windows

### Linux 构建产物

- **AppImage**: 通用格式，无需安装（推荐）
- **DEB**: Debian/Ubuntu 包
- **RPM**: RedHat/Fedora 包
- **TAR.GZ**: 压缩归档

架构：

- `x64`: 64 位 Linux
- `arm64`: ARM64 Linux
- `armv7l`: ARMv7 Linux (如树莓派)

## 配置文件格式

`configs/config.json`:

```json
{
  "allowedWebsites": [
    "https://example1.com",
    "https://example2.com",
    "https://subdomain.example3.com"
  ]
}
```

**注意事项**：

- URL 必须包含协议 (`https://` 或 `http://`)
- 可以包含子域名
- 支持同一域名的所有子域名

## 常见问题

### Q: 如何添加更多网站？

A: 在 GitHub Actions 运行时输入新的网站列表，或修改 `config.json` 后重新构建。

### Q: 能否在运行时修改白名单？

A: 当前版本不支持运行时修改，需要重新构建应用。

### Q: 为什么某些网站无法加载？

A: 确保 URL 格式正确，包含 `https://` 或 `http://` 前缀。

### Q: 应用能否记住浏览历史？

A: 当前版本支持会话内的前进/后退，但不持久化历史记录。

## 开发说明

### 项目结构

```
weap/
├── src/
│   ├── main.js          # Electron 主进程
│   ├── preload.js       # 预加载脚本
│   ├── renderer.js      # 渲染进程脚本
│   ├── index.html       # 主界面
│   └── styles.css       # 样式文件
├── configs/
│   └── config.json      # 配置文件
├── .github/
│   └── workflows/
│       └── build.yml    # GitHub Actions 工作流
└── package.json         # 项目配置
```

### 技术栈

- **Electron**: 跨平台桌面应用框架
- **electron-builder**: 打包和分发工具
- **GitHub Actions**: CI/CD 自动化

### 自定义开发

如需添加新功能，主要修改以下文件：

1. **src/main.js**: 主进程逻辑、安全策略
2. **src/renderer.js**: 界面交互逻辑
3. **src/index.html** & **src/styles.css**: 界面样式

## 许可证

MIT License - 可自由使用、修改和分发
