#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  osascript -e 'display dialog "请先安装 Node.js 18 或更高版本。\nhttps://nodejs.org/" buttons {"好"} default button 1'
  exit 1
fi

if [ ! -d node_modules ]; then
  npm install
fi

npm run dev
