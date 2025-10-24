#!/bin/bash

echo "🚀 WEAP Browser - 快速启动脚本"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请访问 https://nodejs.org/ 下载安装"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装依赖..."
    npm install
    echo ""
fi

# 检查配置文件
if [ ! -f "configs/config.json" ]; then
    echo "⚠️  配置文件不存在，创建默认配置..."
    mkdir -p configs
    cat > configs/config.json << EOF
{
  "allowedWebsites": [
    "https://github.com",
    "https://www.google.com"
  ]
}
EOF
    echo "✅ 已创建默认配置文件"
    echo ""
fi

echo "📝 当前允许访问的网站:"
cat configs/config.json
echo ""
echo "================================"
echo "🎉 启动应用..."
echo ""

npm start
