#!/usr/bin/env bash
# ============================================================
# SugarCheck - Construir y subir las imágenes a Docker Hub
#
# Uso (en tu PC):
#   docker login
#   ./deploy/push.sh
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

log() { echo -e "\n\033[1;34m==>\033[0m $*"; }

[[ -f .env ]] || { echo "Falta .env en la raíz. Copia .env.example y pon tu DOCKERHUB_USER."; exit 1; }

USER_NAME="$(sed -n 's/^DOCKERHUB_USER=//p' .env | head -n1 | tr -d '\r\"')"
[[ -n "$USER_NAME" && "$USER_NAME" != "tu-usuario" ]] \
  || { echo "Configura DOCKERHUB_USER en .env"; exit 1; }

log "Construyendo imágenes ($USER_NAME)"
docker compose build

log "Subiendo a Docker Hub"
docker compose push

echo
echo "Listo. En el servidor:"
echo "  cd /opt/sugarcheck && ./deploy/update.sh"
