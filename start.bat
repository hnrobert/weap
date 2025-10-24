@echo off
echo.
echo 🚀 WEAP Browser - 快速启动脚本
echo ================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未安装 Node.js
    echo 请访问 https://nodejs.org/ 下载安装
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 📦 正在安装依赖...
    call npm install
    echo.
)

REM 检查配置文件
if not exist "configs\config.json" (
    echo ⚠️  配置文件不存在，创建默认配置...
    if not exist "configs" mkdir configs
    (
        echo {
        echo   "allowedWebsites": [
        echo     "https://github.com",
        echo     "https://www.google.com"
        echo   ]
        echo }
    ) > configs\config.json
    echo ✅ 已创建默认配置文件
    echo.
)

echo 📝 当前允许访问的网站:
type configs\config.json
echo.
echo ================================
echo 🎉 启动应用...
echo.

npm start
