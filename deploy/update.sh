#!/usr/bin/env bash
# ============================================================
# SugarCheck - Actualizar despliegue (descarga imágenes de Docker Hub)
#
# Uso (en el servidor):
#   cd /opt/sugarcheck && ./deploy/update.sh
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

log() { echo -e "\n\033[1;34m==>\033[0m $*"; }

log "Git pull"
git pull --ff-only || true

log "Descargando imágenes"
docker compose pull

log "Levantando contenedores"
docker compose up -d --no-build --remove-orphans

log "Estado"
docker compose ps

echo
echo "Logs:  docker compose logs -f"
echo "API:   docker compose logs -f api"
