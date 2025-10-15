#!/usr/bin/env bash
set -e

# Installer deps si node_modules absent (montage bind)
if [ ! -d node_modules ]; then
  echo ">> Installing API dependencies..."
  npm ci || npm install
fi

# Générer Prisma client (safe si déjà fait)
npx prisma generate || true

echo ">> Starting NestJS API (watch mode)..."
npm run start:dev
