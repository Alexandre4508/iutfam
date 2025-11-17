#!/usr/bin/env bash
# =====================================================================
#  IUTFAM – Script d'installation automatisée
#  Version : stable 2025
#
#  Ce script :
#   ✔ Vérifie Docker + Docker Compose
#   ✔ Génère les fichiers .env nécessaires
#   ✔ Build & démarre Postgres + API NestJS + Web Next.js
#   ✔ Initialise Prisma (generate + db push + seed)
#   ✔ Redémarre l'API après le seed
#   ✔ Teste automatiquement les URLs du front et de l'API
#
#  Utilisation :
#      ./setup_linux.sh
#      ./setup_linux.sh --force   (réécrit les .env)
# =====================================================================

set -euo pipefail

# ------------------------------------------------------------
# Fonctions d'affichage
# ------------------------------------------------------------
info() { printf "\033[1;34m• %s\033[0m\n" "$*"; }
ok()   { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }
warn() { printf "\033[1;33m! %s\033[0m\n" "$*"; }
err()  { printf "\033[1;31m✗ %s\033[0m\n" "$*" >&2; }

FORCE=0
[[ "${1-}" == "-f" || "${1-}" == "--force" ]] && FORCE=1

# ------------------------------------------------------------
# Étape 0 : Vérification Docker
# ------------------------------------------------------------
info "Vérification de Docker…"

if ! command -v docker >/dev/null 2>&1; then
    err "Docker n'est pas installé. Installez Docker Desktop / Engine."
    exit 1
fi

if ! docker version >/dev/null 2>&1; then
    err "Docker ne tourne pas. Démarrez-le puis relancez le script."
    exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
    err "Le plugin Docker Compose v2 n'est pas disponible."
    exit 1
fi

ok "Docker + Docker Compose détectés."

# ------------------------------------------------------------
# Étape 1 : Préparer chemins + templates
# ------------------------------------------------------------
ROOT_DIR="$(pwd)"
API_ENV="${ROOT_DIR}/iutfam-api/.env"
WEB_ENV="${ROOT_DIR}/iutfam-web/.env.local"

API_ENV_CONTENT=$'JWT_SECRET=super-long-secret\nALLOWED_EMAIL_DOMAINS=*\nDATABASE_URL=postgresql://postgres:postgres@postgres:5432/iutfam?schema=public\n'
WEB_ENV_CONTENT=$'NEXT_PUBLIC_API_URL=http://localhost:4000\n'

# ------------------------------------------------------------
# Étape 2 : Création des fichiers .env
# ------------------------------------------------------------
info "Création des fichiers .env…"

# -- API --
if [[ -f "$API_ENV" && $FORCE -eq 0 ]]; then
    warn "iutfam-api/.env existe déjà (non modifié)."
else
    mkdir -p "$(dirname "$API_ENV")"
    printf "%s" "$API_ENV_CONTENT" > "$API_ENV"
    ok "Créé : iutfam-api/.env"
fi

# -- WEB --
if [[ -f "$WEB_ENV" && $FORCE -eq 0 ]]; then
    warn "iutfam-web/.env.local existe déjà (non modifié)."
else
    mkdir -p "$(dirname "$WEB_ENV")"
    printf "%s" "$WEB_ENV_CONTENT" > "$WEB_ENV"
    ok "Créé : iutfam-web/.env.local"
fi

# ------------------------------------------------------------
# Étape 3 : Lancer les conteneurs
# ------------------------------------------------------------
info "Construction & démarrage des conteneurs Docker…"

docker compose up -d --build

ok "Conteneurs démarrés."

# ------------------------------------------------------------
# Étape 4 : Initialiser Prisma dans l'API
# ------------------------------------------------------------
info "Initialisation Prisma (generate, db push, seed)…"

sleep 3   # laisse l'API démarrer

docker compose exec api npx prisma generate
docker compose exec api npx prisma db push
docker compose exec api npx ts-node prisma/seed.ts

docker compose restart api
ok "Prisma initialisé et API redémarrée."

# ------------------------------------------------------------
# Étape 5 : Vérifications finales
# ------------------------------------------------------------
API_URL="http://localhost:4000/health"
WEB_URL="http://localhost:3000"

info "Vérification API (${API_URL})…"
if curl -fsS "$API_URL" >/dev/null 2>&1; then
    ok "API OK ✔ ($API_URL)"
else
    warn "API non accessible pour le moment."
    warn "Inspectez : docker compose logs -f api"
fi

info "Vérification Front (${WEB_URL})…"
if curl -fsS "$WEB_URL" >/dev/null 2>&1; then
    ok "Frontend OK ✔ ($WEB_URL)"
else
    warn "Frontend non accessible."
    warn "Inspectez : docker compose logs -f web"
fi

# ------------------------------------------------------------
# FIN
# ------------------------------------------------------------
echo ""
ok "Installation terminée avec succès ! 🎉"
echo ""
echo "Accès au site :"
echo "  👉 Frontend : $WEB_URL"
echo "  👉 API :      $API_URL"
echo ""
info "Commandes utiles :"
echo "  docker compose ps"
echo "  docker compose logs -f api"
echo "  docker compose logs -f web"
echo "  docker compose down"
echo "  docker compose up -d --build"
echo ""
