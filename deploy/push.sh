#!/usr/bin/env bash
# ============================================================
# SugarCheck - Construir y subir las imágenes a Docker Hub
#
# Uso (en tu PC):
#   docker login
#   ./deploy/push.sh
#
# Sube dos tags al repo gayer12/sugarcheck:
#   :api   → backend NestJS
#   :web   → frontend Vite + Caddy
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

log() { echo -e "\n\033[1;34m==>\033[0m $*"; }

log "Construyendo imágenes"
docker compose build

log "Subiendo a Docker Hub"
docker compose push

echo
echo "Listo. En el servidor:"
echo "  cd /opt/sugarcheck && ./deploy/update.sh"
