#!/usr/bin/env bash
set -euo pipefail

echo "========================================"
echo "  IUTFAM – Script d'installation Linux  "
echo "========================================"

# 1) Vérifier Docker
if ! command -v docker &> /dev/null; then
  echo "❌ Docker n'est pas installé ou pas dans le PATH."
  echo "   --> Installe Docker (Docker Desktop ou Docker Engine) puis relance ce script."
  exit 1
fi

if ! docker info &> /dev/null; then
  echo "❌ Docker ne tourne pas (daemon/engine KO)."
  echo "   --> Démarre Docker puis relance ce script."
  exit 1
fi

echo "✅ Docker détecté et en cours d'exécution."

# 2) Création des fichiers .env si absents
echo
echo "----------------------------------------"
echo "  Configuration des variables d'environnement"
echo "----------------------------------------"

# .env à la racine
if [ ! -f ".env" ]; then
  cat > .env << 'EOF'
JWT_SECRET=un-super-secret-a-changer
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/iutfam?schema=public
EOF
  echo "✅ Fichier .env créé à la racine."
else
  echo "ℹ️ Fichier .env déjà présent à la racine (non modifié)."
fi

# .env pour l'API
if [ ! -d "iutfam-api" ]; then
  echo "❌ Dossier iutfam-api introuvable. Vérifie que tu es bien à la racine du projet."
  exit 1
fi

if [ ! -f "iutfam-api/.env" ]; then
  cat > iutfam-api/.env << 'EOF'
JWT_SECRET=un-super-secret-a-changer
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/iutfam?schema=public
ALLOWED_EMAIL_DOMAINS=*
EOF
  echo "✅ Fichier iutfam-api/.env créé."
else
  echo "ℹ️ Fichier iutfam-api/.env déjà présent (non modifié)."
fi

# .env.local pour le front
if [ ! -d "iutfam-web" ]; then
  echo "❌ Dossier iutfam-web introuvable. Vérifie que tu es bien à la racine du projet."
  exit 1
fi

if [ ! -f "iutfam-web/.env.local" ]; then
  cat > iutfam-web/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
  echo "✅ Fichier iutfam-web/.env.local créé."
else
  echo "ℹ️ Fichier iutfam-web/.env.local déjà présent (non modifié)."
fi

# 3) Build + lancement des conteneurs
echo
echo "----------------------------------------"
echo "  Construction et démarrage des conteneurs"
echo "----------------------------------------"

docker compose down || true
docker compose up -d --build

echo "✅ Conteneurs démarrés."

# 4) Prisma : generate + push + seed
echo
echo "----------------------------------------"
echo "  Initialisation Prisma (generate, db push, seed)"
echo "----------------------------------------"

docker compose exec api npx prisma generate
docker compose exec api npx prisma db push
docker compose exec api npx ts-node prisma/seed.ts || true

# 5) Restart API
docker compose restart api

echo
echo "========================================"
echo "  Installation terminée !"
echo "  Front :  http://localhost:3000"
echo "  API :    http://localhost:4000/health"
echo "========================================"
