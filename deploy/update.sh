#!/usr/bin/env bash
# ============================================================
# SugarCheck - Actualizar despliegue
#
# Uso (como usuario deploy):
#   cd /opt/sugarcheck && ./deploy/update.sh
# ============================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/sugarcheck}"
cd "$APP_DIR"

log() { echo -e "\n\033[1;34m==>\033[0m $*"; }

log "Git pull"
git pull --ff-only

log "Backend: dependencias, build y migraciones"
cd "$APP_DIR/backend"
pnpm install --frozen-lockfile || pnpm install
pnpm exec dotenv-cli -e .env.production -- pnpm build
pnpm exec dotenv-cli -e .env.production -- prisma migrate deploy

log "Frontend: dependencias y build"
cd "$APP_DIR/frontend"
pnpm install --frozen-lockfile || pnpm install
pnpm build

log "Reiniciando servicios"
sudo systemctl restart sugarcheck-api
sudo systemctl reload caddy

systemctl --no-pager --lines=10 status sugarcheck-api || true
echo
echo "Listo. Logs: journalctl -u sugarcheck-api -f"
