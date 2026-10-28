#!/usr/bin/env bash
# ============================================================
# SugarCheck - Bootstrap de producción (Debian 12/13 + Caddy)
#
# Uso:
#   sudo bash deploy/install.sh sugarcheck.tudominio.com [rama]
#
# Variables opcionales:
#   APP_DIR=/opt/sugarcheck  APP_USER=deploy
#   REPO_URL=https://github.com/GabrielLeonett/SugarCheck.git
# ============================================================
set -euo pipefail

DOMAIN="${1:-${DOMAIN:-}}"
BRANCH="${2:-${BRANCH:-main}}"
REPO_URL="${REPO_URL:-https://github.com/GabrielLeonett/SugarCheck.git}"
APP_DIR="${APP_DIR:-/opt/sugarcheck}"
APP_USER="${APP_USER:-deploy}"

log()  { echo -e "\n\033[1;34m==>\033[0m $*"; }
warn() { echo -e "\033[1;33m[!]\033[0m $*"; }
die()  { echo -e "\033[1;31m[x]\033[0m $*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || die "Ejecuta como root: sudo bash deploy/install.sh <dominio>"
[[ -n "$DOMAIN" ]] || die "Falta el dominio. Uso: sudo bash deploy/install.sh sugarcheck.tudominio.com"

# ------------------------------------------------------------
# 1. Paquetes base
# ------------------------------------------------------------
log "Instalando paquetes base"
apt update
apt install -y curl git build-essential ca-certificates gnupg ufw nano \
  debian-keyring debian-archive-keyring apt-transport-https

# ------------------------------------------------------------
# 2. Node 22 + pnpm
# ------------------------------------------------------------
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v)" != v22.* ]]; then
  log "Instalando Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install -y nodejs
fi
log "Node $(node -v) / npm $(npm -v)"

corepack enable
corepack prepare pnpm@11.15.1 --activate || npm install -g pnpm@11
log "pnpm $(pnpm -v)"

# ------------------------------------------------------------
# 3. Caddy (repo oficial)
# ------------------------------------------------------------
if ! command -v caddy >/dev/null 2>&1; then
  log "Instalando Caddy"
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt update
  apt install -y caddy
fi
log "Caddy $(caddy version | head -n1)"

# ------------------------------------------------------------
# 4. nginx no puede ocupar el 80
# ------------------------------------------------------------
if systemctl is-active --quiet nginx; then
  die "nginx está activo y ocupa el puerto 80. Ejecuta: systemctl disable --now nginx"
fi

# ------------------------------------------------------------
# 5. Usuario de la app
# ------------------------------------------------------------
if ! id "$APP_USER" >/dev/null 2>&1; then
  log "Creando usuario $APP_USER"
  adduser --disabled-password --gecos "" "$APP_USER"
  usermod -aG sudo "$APP_USER"
fi

# update.sh necesita reiniciar servicios sin pedir contraseña.
cat > /etc/sudoers.d/sugarcheck-deploy <<EOF
$APP_USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart sugarcheck-api, /usr/bin/systemctl reload caddy
EOF
chmod 440 /etc/sudoers.d/sugarcheck-deploy
visudo -cf /etc/sudoers.d/sugarcheck-deploy >/dev/null

# ------------------------------------------------------------
# 6. Código
# ------------------------------------------------------------
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"

if [[ ! -d "$APP_DIR/.git" ]]; then
  log "Clonando $REPO_URL ($BRANCH) en $APP_DIR"
  sudo -u "$APP_USER" -H git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR" \
    || die "No se pudo clonar. Si el repo es privado, configura una deploy key para $APP_USER."
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# ------------------------------------------------------------
# 7. Variables de entorno
# ------------------------------------------------------------
ENV_FILE="$APP_DIR/backend/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  log "Creando $ENV_FILE desde la plantilla"
  sed "s|__DOMAIN__|$DOMAIN|g" \
    "$APP_DIR/deploy/backend.env.production.example" > "$ENV_FILE"
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"

  warn "Edita $ENV_FILE y rellena Supabase, JWT, Firebase, email e IA."
  warn "Después vuelve a ejecutar: sudo bash $APP_DIR/deploy/install.sh $DOMAIN $BRANCH"
  exit 0
fi

if grep -qE '<REF>|<PASSWORD>|^JWT_SECRET=""|^RESET_TOKEN_SECRET=""' "$ENV_FILE"; then
  warn "El archivo $ENV_FILE todavía tiene placeholders o secretos vacíos."
  warn "Rellénalo y vuelve a ejecutar el script."
  exit 0
fi

if ! grep -q '^NODE_ENV=production' "$ENV_FILE"; then
  warn "NODE_ENV no es 'production' en $ENV_FILE. Las cookies saldrán sin Secure."
fi

FRONT_ENV="$APP_DIR/frontend/.env.production"
sed "s|__DOMAIN__|$DOMAIN|g" \
  "$APP_DIR/deploy/frontend.env.production.example" > "$FRONT_ENV"
chown "$APP_USER:$APP_USER" "$FRONT_ENV"

# ------------------------------------------------------------
# 8. Dependencias, migraciones y build
# ------------------------------------------------------------
run_app() {
  local dir="$1"
  shift
  sudo -u "$APP_USER" -H bash -lc "cd '$APP_DIR/$dir' && $*"
}

# Prisma (prisma.config.ts) lee DIRECT_URL del entorno. No hacemos `source`
# del .env porque un valor sin comillas con espacios rompería el shell.
DIRECT_URL_VALUE="$(sed -n 's/^DIRECT_URL=//p' "$ENV_FILE" | head -n1 | sed 's/^"//; s/"$//')"
[[ -n "$DIRECT_URL_VALUE" ]] || die "DIRECT_URL está vacío en $ENV_FILE"

# --prod=false: el servidor necesita devDependencies (nest CLI, prisma,
# typescript) para poder compilar.
log "Instalando dependencias del backend"
run_app backend "pnpm install --prod=false --frozen-lockfile || pnpm install --prod=false"

log "Aplicando migraciones de Prisma"
run_app backend "DIRECT_URL='$DIRECT_URL_VALUE' pnpm exec prisma migrate deploy"

log "Compilando backend"
run_app backend "pnpm build"

log "Instalando dependencias del frontend"
run_app frontend "pnpm install --prod=false --frozen-lockfile || pnpm install --prod=false"

log "Compilando frontend"
run_app frontend "pnpm build"

# ------------------------------------------------------------
# 9. Servicio systemd del backend
# ------------------------------------------------------------
log "Configurando servicio systemd"
UNIT_TMP="$(mktemp)"
sed -e "s|__APP_DIR__|$APP_DIR|g" -e "s|__APP_USER__|$APP_USER|g" \
  "$APP_DIR/deploy/sugarcheck-api.service" > "$UNIT_TMP"
install -m 644 "$UNIT_TMP" /etc/systemd/system/sugarcheck-api.service
rm -f "$UNIT_TMP"

systemctl daemon-reload
# Un intento anterior pudo dejar la unidad enmascarada.
systemctl unmask sugarcheck-api >/dev/null 2>&1 || true
systemctl enable sugarcheck-api
systemctl restart sugarcheck-api \
  || warn "El backend no arrancó. Revisa: journalctl -u sugarcheck-api -n 100 --no-pager"

# ------------------------------------------------------------
# 10. Caddy
# ------------------------------------------------------------
log "Configurando Caddy"
# Escribimos a un temporal y solo reemplazamos el Caddyfile real si la
# validación pasa. Así un error no deja /etc/caddy/Caddyfile vacío.
CADDY_TMP="$(mktemp)"
sed -e "s|__DOMAIN__|$DOMAIN|g" -e "s|__APP_DIR__|$APP_DIR|g" \
  "$APP_DIR/deploy/Caddyfile" > "$CADDY_TMP"

# Caddy corre como usuario "caddy": necesita poder leer el build.
chmod 755 /opt "$APP_DIR" "$APP_DIR/frontend" "$APP_DIR/frontend/dist" 2>/dev/null || true

if ! caddy validate --config "$CADDY_TMP" --adapter caddyfile; then
  rm -f "$CADDY_TMP"
  die "El Caddyfile generado no es válido. Revisa $APP_DIR/deploy/Caddyfile"
fi

install -m 644 "$CADDY_TMP" /etc/caddy/Caddyfile
rm -f "$CADDY_TMP"

systemctl enable caddy
systemctl restart caddy

# ------------------------------------------------------------
# 11. Firewall
# ------------------------------------------------------------
log "Configurando ufw"
ufw allow OpenSSH || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ------------------------------------------------------------
# 12. Resumen
# ------------------------------------------------------------
chmod +x "$APP_DIR/deploy/"*.sh 2>/dev/null || true

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
log "Listo"
echo "  Web:  https://$DOMAIN"
echo "  API:  https://$DOMAIN/auth/login"
echo "  Logs: journalctl -u sugarcheck-api -f"
echo "        journalctl -u caddy -f"
echo
echo "DNS: $DOMAIN -> ${IP:-IP_DEL_SERVIDOR}"
echo "Abre 80/443 también en el firewall del proveedor si aplica."
