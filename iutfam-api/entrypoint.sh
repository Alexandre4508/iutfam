#!/usr/bin/env bash
set -e

# Générer Prisma client (si image rebuild)
npx prisma generate

# Appliquer les migrations en prod
npx prisma migrate deploy

# Seed optionnel (décommente si tu veux un seed à chaque déploiement)
# node prisma/seed.cjs || true

# Démarrer l’API
node dist/main.js
