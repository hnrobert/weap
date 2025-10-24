# WEAP Browser

一个基于 Electron 的白名单浏览器应用程序。

## 功能特性

- ✅ 网站白名单控制 - 仅允许访问预定义的网站
- ✅ 多网站快速切换 - 点击顶部标签快速切换不同网站
- ✅ 基础浏览功能 - 后退、前进、刷新
- ✅ 自动化构建 - 支持所有主流平台和架构

## 支持的平台

### macOS

- Intel (x64)
- Apple Silicon (arm64)

### Windows

- 64-bit (x64)

### Linux

- x64

> **注意**: 如需其他架构，可以修改 `package.json` 中的 `build` 配置

## 本地开发

### 安装依赖

```bash
npm install
```

### 配置允许的网站

编辑 `configs/config.json`:

```json
{
  "allowedWebsites": ["https://github.com", "https://google.com"]
}
```

### 启动应用

```bash
npm start
```

### 构建应用

```bash
# 构建所有平台
npm run build

# 构建特定平台
npm run build:mac
npm run build:win
npm run build:linux
```

## 使用 GitHub Actions 自动构建

### 重要提示

**无需 package-lock.json**: 本项目已配置为不使用 lock 文件，直接运行即可。

如遇到依赖问题，删除 `node_modules` 重新安装：

```bash
rm -rf node_modules
npm install
```

### 构建步骤

1. 进入仓库的 **Actions** 标签页
2. 选择 **Build Electron App** 工作流
3. 点击 **Run workflow**
4. 输入允许访问的网站列表（用逗号分隔），例如:

   ```text
   https://github.com,https://google.com,https://stackoverflow.com
   ```

5. 点击 **Run workflow** 开始构建

构建完成后，会自动创建一个 Release，包含所有平台的安装包。

## 工作流程

1. 用户通过 GitHub Actions 的 workflow_dispatch 输入网站列表
2. 自动生成 `config.json` 配置文件
3. 并行构建主流平台（macOS x64/arm64, Windows x64, Linux x64）
4. 将所有构建产物打包并创建 Release

## 体积优化

本项目已进行以下优化以减小应用体积：

- ✅ 使用最大压缩级别
- ✅ 过滤不必要的文件（文档、测试、示例）
- ✅ 不使用 package-lock.json
- ✅ 零运行时依赖（仅使用 Electron 内置模块）
- ✅ 只构建主流平台和架构

**预期包体积**:

- macOS: ~90-120 MB
- Windows: ~80-100 MB
- Linux: ~90-110 MB

详见 [OPTIMIZATION.md](OPTIMIZATION.md) 了解更多优化细节。

## 安全特性

- 严格的网站白名单控制
- 阻止所有未经授权的导航
- 拦截弹出窗口和新标签页
- 阻止未授权的网络请求

## 许可证

MIT License
