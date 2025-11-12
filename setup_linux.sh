#!/usr/bin/env bash
# IUTFAM – Setup automatique (Linux)
# Usage:
#   ./setup_linux.sh          # crée les .env s'ils n'existent pas, build & up
#   ./setup_linux.sh --force  # écrase les .env puis build & up

set -euo pipefail

FORCE=0
[[ "${1-}" == "-f" || "${1-}" == "--force" ]] && FORCE=1

info(){ printf "• %s\n" "$*"; }
ok(){ printf "✓ %s\n" "$*"; }
warn(){ printf "! %s\n" "$*"; }
err(){ printf "✗ %s\n" "$*" >&2; }

# 0) prérequis (Docker + compose plugin)
if ! command -v docker >/dev/null 2>&1; then
  err "Docker n'est pas installé. Installez Docker Desktop/Engine puis relancez."
  exit 1
fi
if ! docker version >/dev/null 2>&1; then
  err "Docker ne répond pas. Démarrez le service (ex: sudo systemctl start docker)."
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  err "Le plugin 'docker compose' (v2) n'est pas présent. Installez-le puis réessayez."
  exit 1
fi
ok "Docker et Docker Compose (v2) détectés."

ROOT_DIR="$(pwd)"
API_ENV="${ROOT_DIR}/iutfam-api/.env"
WEB_ENV="${ROOT_DIR}/iutfam-web/.env.local"

# 1) .env API (obligatoire)
API_CONTENT=$'JWT_SECRET=super-long-secret\nALLOWED_EMAIL_DOMAINS=*\nDATABASE_URL=postgresql://postgres:postgres@postgres:5432/iutfam?schema=public\n'
if [[ -f "$API_ENV" && $FORCE -eq 0 ]]; then
  warn "iutfam-api/.env existe déjà (aucune modification). Utilisez --force pour écraser."
else
  mkdir -p "$(dirname "$API_ENV")"
  printf "%s" "$API_CONTENT" > "$API_ENV"
  ok "créé/écrasé : iutfam-api/.env"
fi

# 2) .env.local WEB (optionnel mais pratique)
WEB_CONTENT=$'NEXT_PUBLIC_API_URL=http://localhost:4000\n'
if [[ -f "$WEB_ENV" && $FORCE -eq 0 ]]; then
  warn "iutfam-web/.env.local existe déjà (aucune modification). Utilisez --force pour écraser."
else
  mkdir -p "$(dirname "$WEB_ENV")"
  printf "%s" "$WEB_CONTENT" > "$WEB_ENV"
  ok "créé/écrasé : iutfam-web/.env.local"
fi

# 3) Build & Up
info "Construction et démarrage des services (postgres, api, web)…"
docker compose up -d --build
ok "Conteneurs démarrés."

# 4) Attendre quelques secondes que l'API boot
sleep 3

# 5) Petits checks
API_URL="http://localhost:4000/health"
WEB_URL="http://localhost:3000"

info "Vérification API (${API_URL})…"
if curl -fsS "$API_URL" >/dev/null; then
  ok "API OK : ${API_URL}"
else
  warn "API non joignable pour l'instant. Consultez les logs:  docker compose logs -f api"
fi

info "Vérification Front (${WEB_URL})…"
if curl -fsS "$WEB_URL" >/dev/null; then
  ok "Front OK : ${WEB_URL}"
else
  warn "Front non joignable pour l'instant. Consultez les logs:  docker compose logs -f web"
fi

echo
ok "Terminé."
echo "Frontend : ${WEB_URL}"
echo "API      : ${API_URL}"
echo
info "Commandes utiles :"
echo "  docker compose ps"
echo "  docker compose logs -f api"
echo "  docker compose logs -f web"
