# Despliegue de SugarCheck con Docker Hub

Las imágenes se construyen en tu PC y se suben a Docker Hub. El servidor solo
las descarga: no compila nada y no necesita Node ni pnpm.

```
TU PC                          DOCKER HUB                 SERVIDOR
docker compose build   ──►   sugarcheck-api:latest  ──►   docker compose pull
docker compose push          sugarcheck-web:latest        docker compose up -d
```

## Contenido

| Archivo | Para qué |
|---|---|
| `docker-compose.yml` | Servicios `migrate`, `api` y `web` |
| `backend/Dockerfile` | Imagen de la API (una sola, sirve para migrar y correr) |
| `frontend/Dockerfile` | Build de Vite + Caddy sirviendo el estático |
| `deploy/Caddyfile` | Proxy, SPA y SSE (se monta en el contenedor) |
| `deploy/push.sh` | Build + push (se ejecuta en tu PC) |
| `deploy/update.sh` | Pull + up (se ejecuta en el servidor) |
| `deploy/backend.env.example` | Plantilla del `backend/.env` |

## En tu PC

### 1. Cuenta de Docker Hub

```bash
docker login
```

Si no tienes cuenta: https://hub.docker.com/signup. El repo
`gayer12/sugarcheck` ya está creado; los tags se suben solos.

### 2. Construir y subir

```bash
./deploy/push.sh
```

Sube dos tags al repo `gayer12/sugarcheck`:

- `:api` → backend NestJS
- `:web` → frontend Vite + Caddy

La primera vez tarda bastante (compila Vite y el backend); las siguientes
reutilizan caché.

## En el servidor

### 1. Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### 2. Liberar los puertos 80 y 443

Si antes intentaste el despliegue nativo, Caddy y el servicio systemd siguen
ocupando los puertos:

```bash
systemctl disable --now caddy sugarcheck-api 2>/dev/null || true
systemctl unmask sugarcheck-api 2>/dev/null || true
rm -f /etc/systemd/system/sugarcheck-api.service
systemctl daemon-reload
```

### 3. Código

```bash
cd /opt/sugarcheck
git config --global --add safe.directory /opt/sugarcheck
git pull
```

### 4. Variables de la aplicación

```bash
cp deploy/backend.env.example backend/.env
nano backend/.env
```

Mínimo obligatorio:

- `NODE_ENV=production`
- `DATABASE_URL` y `DIRECT_URL` (Supabase)
- `JWT_SECRET` y `RESET_TOKEN_SECRET` (`openssl rand -base64 48`)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `CORS_ORIGIN` y `FRONTEND_URL` → `https://sugarcheck.duckdns.org`

Opcionales: email (Gmail) y `GEMINI_API_KEY`.

> `backend/.env` no se versiona ni se copia a la imagen. Compose lo inyecta en
> tiempo de ejecución con `env_file`.

### 5. Liberar espacio (si ya habías intentado compilar aquí)

```bash
docker builder prune -af
docker image prune -af
rm -rf node_modules backend/node_modules frontend/node_modules mobile/node_modules
df -h /
```

> **No** uses `docker system prune --volumes`: borraría `caddy_data`, donde
> viven los certificados.

### 6. Levantar

```bash
cd /opt/sugarcheck
./deploy/update.sh
```

O a mano:

```bash
docker compose pull
docker compose up -d --no-build
docker compose ps
```

## Verificar

```bash
docker compose ps
```

Debe mostrar `migrate` como `exited (0)` y `api` / `web` como `running`.

```bash
docker compose logs migrate
docker compose logs -f api
docker compose logs -f web
```

Desde fuera:

```bash
curl -I https://sugarcheck.duckdns.org
```

## Día a día

En tu PC, tras cambiar código:

```bash
./deploy/push.sh
```

En el servidor:

```bash
cd /opt/sugarcheck && ./deploy/update.sh
```

Otros comandos:

```bash
docker compose logs -f api      # logs del backend
docker compose restart api      # reiniciar solo la API
docker compose ps               # estado
docker compose down             # parar todo
```

## Cómo funciona el proxy

- `/` y `/assets/*` → `/srv` (build de Vite) con fallback a `index.html`.
- `/auth/*`, `/user/*`, `/notification/*`, `/insulina/*`, `/sync/*`, `/imc/*`,
  `/hba1c/*`, `/glucose/*`, `/preference/*`, `/oraculo/*`, `/export/*`,
  `/camino/*`, `/contact-emergence/*` → `api:3000`.
- `/socket.io/*` → `api:3000` (WebSocket).
- El stream del Oráculo (`/oraculo/.../messages/stream`, SSE) usa
  `flush_interval -1` para que los tokens salgan en tiempo real.

## Notas

- **`VITE_BACKEND_URL` se hornea en el build.** Si cambias de dominio, edita el
  build-arg en `docker-compose.yml` y `deploy/Caddyfile`, y vuelve a hacer
  `./deploy/push.sh`.
- `migrate` usa la **misma imagen** que `api` con otro comando, así que el
  servidor solo guarda dos imágenes.
- Los certificados viven en el volumen `caddy_data`; sobreviven a los updates.
- `api` no publica puertos: solo Caddy habla con él dentro de la red de Docker.
- El servidor necesita **80 y 443 abiertos** en el firewall del proveedor
  (en GCP: VPC network → Firewall). `ufw` no basta.
- El DNS `A` de `sugarcheck.duckdns.org` debe apuntar a la IP pública de la VM.

## Seguridad

`backend/.env.development` está trackeado en git con credenciales reales
(Supabase, Firebase, Gmail, Gemini, JWT). Rótalas y sácalo del repo:

```bash
git rm --cached backend/.env.development
git commit -m "chore: remove env file with secrets"
git push
```

El historial de git conserva el archivo: si el repo es público, purga con
`git filter-repo`. Rota también la llave de Firebase en Google Cloud IAM.
