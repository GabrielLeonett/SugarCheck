# Despliegue de SugarCheck con Docker

Backend NestJS + frontend Vite + Caddy (HTTPS automático) en tres contenedores.
El móvil (Expo) no se despliega aquí.

## Contenido

| Archivo | Para qué |
|---|---|
| `docker-compose.yml` (raíz) | Orquesta `migrate`, `api` y `web` |
| `backend/Dockerfile` | Imagen de la API (multi-stage) |
| `frontend/Dockerfile` | Build de Vite + Caddy sirviendo el estático |
| `deploy/Caddyfile` | Proxy, SPA y SSE (se monta en el contenedor) |
| `deploy/update.sh` | `git pull` + rebuild + up |
| `deploy/backend.env.production.example` | Plantilla del `.env.production` |

## Requisitos

- Docker + Docker Compose v2.
- DNS: registro **A** `sugarcheck.duckdns.org` → IP pública de la VM.
- Puertos **80 y 443** abiertos también en el firewall del proveedor
  (en GCP: VPC network → Firewall, no basta `ufw`).

## 1. Instalar Docker (Debian)

```bash
curl -fsSL https://get.docker.com | sh
docker --version
docker compose version
```

## 2. Liberar los puertos 80/443

Si antes intentaste el despliegue nativo, Caddy y el servicio systemd siguen
ocupando los puertos:

```bash
systemctl disable --now caddy sugarcheck-api 2>/dev/null || true
systemctl unmask sugarcheck-api 2>/dev/null || true
rm -f /etc/systemd/system/sugarcheck-api.service
systemctl daemon-reload
```

## 3. Variables de entorno

```bash
cd /opt/sugarcheck
cp deploy/backend.env.production.example backend/.env.production
nano backend/.env.production
```

Mínimo obligatorio:

- `NODE_ENV=production`
- `DATABASE_URL` y `DIRECT_URL` (Supabase)
- `JWT_SECRET` y `RESET_TOKEN_SECRET` (`openssl rand -base64 48`)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `CORS_ORIGIN` y `FRONTEND_URL` → `https://sugarcheck.duckdns.org`

Opcionales: email (Gmail) y `GEMINI_API_KEY`.

> El archivo **no** se versiona (`.gitignore` cubre `.env*`). Compose lo lee con
> `env_file`, así que los valores llegan al contenedor como variables de entorno.

## 4. Levantar

```bash
cd /opt/sugarcheck
docker compose up -d --build
docker compose ps
```

Orden: `migrate` aplica las migraciones y termina → arranca `api` → Caddy emite
el certificado.

Ver logs:

```bash
docker compose logs -f
docker compose logs -f api
docker compose logs -f web
```

Al terminar: **https://sugarcheck.duckdns.org**

## Actualizar

```bash
cd /opt/sugarcheck
./deploy/update.sh
```

Hace `git pull`, reconstruye las imágenes (incluye migraciones) y reinicia.

## Comandos útiles

```bash
docker compose ps                 # estado
docker compose logs -f api        # logs del backend
docker compose restart api        # reiniciar solo la API
docker compose exec api sh        # shell dentro del contenedor
docker compose down               # parar todo
docker compose up -d --build      # reconstruir
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
  build-arg en `docker-compose.yml` y `deploy/Caddyfile`, y reconstruye con
  `docker compose up -d --build`.
- Los certificados viven en el volumen `caddy_data`; sobreviven a los rebuilds.
  Para empezar de cero: `docker compose down -v` (borra también los certs).
- `api` no publica puertos: solo Caddy habla con él dentro de la red de Docker.
- La imagen del backend copia `node_modules` del stage de build porque
  `@prisma/client` está en `devDependencies` y se genera con `prisma generate`.
  Si algún día lo mueves a `dependencies`, se puede adelgazar la imagen.

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
