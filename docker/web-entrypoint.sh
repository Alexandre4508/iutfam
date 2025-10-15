#!/usr/bin/env bash
set -e

if [ ! -d node_modules ]; then
  echo ">> Installing Web dependencies..."
  npm ci || npm install
fi

echo ">> Starting Next.js frontend (dev)..."
npm run dev
