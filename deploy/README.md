# Despliegue de SugarCheck

El frontend y el backend se construyen en **GitHub Actions** y se publican en
**Docker Hub**. El servidor solo descarga las imágenes: no compila nada y no
necesita Node ni pnpm.

```text
TU REPO (GitHub)              GITHUB ACTIONS              DOCKER HUB                 SERVIDOR
push a main/develop   ──►   build api + web        ──►   sugarcheck:api     ──►   docker compose pull
                                                        sugarcheck:web           docker compose up -d
```

Mobile **no** entra en este flujo: se despliega con Expo/EAS.

## Contenido

| Archivo | Para qué |
|---|---|
| `.github/workflows/docker-publish.yml` | Build y push automático de `api` y `web` |
| `docker-compose.yml` | Servicios `migrate`, `api` y `web` |
| `backend/Dockerfile` | Imagen de la API (sirve para migrar y correr) |
| `frontend/Dockerfile` | Build de Vite + Caddy sirviendo el estático |
| `deploy/Caddyfile` | Proxy, SPA y SSE (se monta en el contenedor) |
| `deploy/push.sh` | Build + push manual (respaldo local) |
| `deploy/update.sh` | Pull + up en el servidor |
| `backend/.env.example` | Plantilla única de variables del backend |
| `frontend/.env.example` | Variables del frontend |
| `mobile/.env.example` | Variables de la app Expo |
| `.env.example` | Variables del `docker-compose` |

## 1. Configurar GitHub Actions

> Asegúrate de que Actions esté habilitado en **Settings → Actions → General →
> Allow all actions and reusable workflows**.

En GitHub: **Settings → Secrets and variables → Actions**.

### Secrets obligatorios

| Secret | Valor |
|---|---|
| `DOCKERHUB_USERNAME` | Tu usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Token de Docker Hub con permisos de lectura y escritura |

> No uses tu contraseña de Docker Hub. Crea un **Personal Access Token** en
> Docker Hub → Account Settings → Security.

### Variables opcionales

| Variable | Valor por defecto | Para qué |
|---|---|---|
| `DOCKERHUB_NAMESPACE` | El username del secret | Namespace de las imágenes (si usas una organización) |
| `DOCKERHUB_REPO` | `sugarcheck` | Nombre del repositorio en Docker Hub |
| `VITE_BACKEND_URL` | `https://sugarcheck.duckdns.org` | URL que se hornea en el frontend |

### Cuándo se ejecuta

- En cada `push` a `main` o `develop` que toque `backend/**`, `frontend/**`,
  el workflow o `docker-compose.yml`.
- Manualmente desde **Actions → Docker publish → Run workflow**.
- No se ejecuta para cambios solo de `mobile/` o documentación.

### Tags publicados

| Imagen | Tags |
|---|---|
| API NestJS | `:api`, `:api-<sha-corto>` |
| Frontend Vite + Caddy | `:web`, `:web-<sha-corto>` |

Los tags `:api` y `:web` son los que usa `docker-compose.yml`. Los tags con SHA
permiten volver a una versión anterior si hace falta.

## 2. Preparar el servidor

### Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### Liberar los puertos 80 y 443

Si antes intentaste el despliegue nativo, Caddy y el servicio systemd siguen
ocupando los puertos:

```bash
systemctl disable --now caddy sugarcheck-api 2>/dev/null || true
systemctl unmask sugarcheck-api 2>/dev/null || true
rm -f /etc/systemd/system/sugarcheck-api.service
systemctl daemon-reload
```

### Código

```bash
cd /opt/sugarcheck
git config --global --add safe.directory /opt/sugarcheck
git pull
```

### Variables de la aplicación

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Mínimo obligatorio:

- `NODE_ENV=production`
- `DATABASE_URL` y `DIRECT_URL` (Supabase)
- `JWT_SECRET` (`openssl rand -base64 48`)
- `CORS_ORIGIN` y `FRONTEND_URL` → `https://sugarcheck.duckdns.org`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`

Opcionales: email (Gmail) y `GEMINI_API_KEY`.

> `backend/.env` no se versiona ni se copia a la imagen. Compose lo inyecta en
> tiempo de ejecución con `env_file`.

Si el repo de Docker Hub es **privado**, inicia sesión antes de descargar:

```bash
docker login
```

### Levantar

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

## 3. Verificar

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

## 4. Día a día

1. Haces push a `main` o `develop`.
2. GitHub Actions construye y sube `:api` y `:web`.
3. En el servidor:

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

### Build manual (respaldo)

Si GitHub Actions no está disponible:

```bash
docker login
./deploy/push.sh
```

## 5. Mobile (Expo/EAS)

El mobile no se construye en Docker. Solo necesita su plantilla de variables:

```bash
cp mobile/.env.example mobile/.env
```

Variable principal:

```env
EXPO_PUBLIC_BACKEND_URL=https://sugarcheck.duckdns.org
```

En EAS, configura `EXPO_PUBLIC_BACKEND_URL` como variable de entorno del build
(o en el perfil de `eas.json`) y ejecuta:

```bash
eas build --platform android
eas build --platform ios
```

> Las variables `EXPO_PUBLIC_*` se incluyen en el bundle de la app. Nunca pongas
> llaves privadas ahí.

## 6. Cómo funciona el proxy

- `/` y `/assets/*` → `/srv` (build de Vite) con fallback a `index.html`.
- `/auth/*`, `/user/*`, `/notification/*`, `/insulina/*`, `/sync/*`, `/imc/*`,
  `/hba1c/*`, `/glucose/*`, `/preference/*`, `/oraculo/*`, `/export/*`,
  `/camino/*`, `/contact-emergence/*` → `api:3000`.
- `/socket.io/*` → `api:3000` (WebSocket).
- El stream del Oráculo (`/oraculo/.../messages/stream`, SSE) usa
  `flush_interval -1` para que los tokens salgan en tiempo real.

## Notas

- **`VITE_BACKEND_URL` se hornea en el build.** Si cambias de dominio, cambia la
  variable en GitHub y vuelve a ejecutar el workflow.
- `migrate` usa la **misma imagen** que `api` con otro comando, así que el
  servidor solo guarda dos imágenes.
- Los certificados viven en el volumen `caddy_data`; sobreviven a los updates.
- `api` no publica puertos: solo Caddy habla con él dentro de la red de Docker.
- El servidor necesita **80 y 443 abiertos** en el firewall del proveedor
  (en GCP: VPC network → Firewall). `ufw` no basta.
- El DNS `A` de `sugarcheck.duckdns.org` debe apuntar a la IP pública de la VM.

## Seguridad

- `backend/.env` y cualquier `.env` real están fuera de git.
- Las variables `VITE_*` y `EXPO_PUBLIC_*` son públicas: no metas secretos ahí.
- La configuración web de Firebase (`apiKey`, `appId`, etc.) es pública por
  diseño; protégela con las reglas de Firebase y restricciones de la API key.
- Si el repo de GitHub fue público con secretos en el historial, **rota todas
  las claves** y purga el historial con `git filter-repo`. La rotación es
  obligatoria aunque purgues: los forks y las cachés de GitHub pueden conservar
  commits antiguos.
