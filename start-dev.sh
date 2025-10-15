#!/bin/bash
echo "🚀 Lancement du backend NestJS..."
(cd /opt/iutfam/iutfam-api && npm run start:dev) &

echo "🌐 Lancement du frontend Next.js..."
(cd /opt/iutfam/iutfam-web && npm run dev)

wait
