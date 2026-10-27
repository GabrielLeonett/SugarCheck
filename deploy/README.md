# Despliegue de SugarCheck en Debian con Caddy

Todo lo necesario para hostear el **backend NestJS** y el **frontend Vite** en un
Debian 12/13, con **Caddy** como reverse proxy y HTTPS automático (Let's Encrypt).

El móvil (Expo) no se despliega aquí: se compila/distribuye aparte.

## Contenido

| Archivo | Para qué |
|---|---|
| `install.sh` | Bootstrap completo: paquetes, Node 22, pnpm, Caddy, usuario, clone, build, systemd y ufw |
| `update.sh` | Actualizar tras un `git push` |
| `Caddyfile` | Plantilla del proxy (se renderiza en `/etc/caddy/Caddyfile`) |
| `sugarcheck-api.service` | Plantilla de systemd |
| `backend.env.production.example` | Plantilla de variables del backend |
| `frontend.env.production.example` | Plantilla del `VITE_BACKEND_URL` |

## Requisitos

- Debian 12/13 con acceso root.
- DNS: registro **A** `sugarcheck.tudominio.com` → `IP_DEL_SERVIDOR`.
- Puertos **22, 80 y 443** abiertos también en el firewall del proveedor
  (Security Group de AWS, firewall de Hetzner/Oracle, etc.).
- Repo accesible: público, o una **deploy key** de GitHub para el usuario `deploy`.

## Instalación rápida

```bash
# 1. Como root: usuario y carpeta
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /opt/sugarcheck && chown deploy:deploy /opt/sugarcheck

# 2. Como deploy: clonar
su - deploy
git clone https://github.com/GabrielLeonett/SugarCheck.git /opt/sugarcheck
exit

# 3. Como root: bootstrap
bash /opt/sugarcheck/deploy/install.sh sugarcheck.tudominio.com main
```

La **primera ejecución** crea `backend/.env.production` y se detiene para que lo
rellenes:

```bash
nano /opt/sugarcheck/backend/.env.production
```

Completa como mínimo:

- `DATABASE_URL` y `DIRECT_URL` de Supabase.
- `JWT_SECRET` y `RESET_TOKEN_SECRET` (`openssl rand -base64 48`).
- `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`.
- `FIREBASE_*` (service account).
- `GEMINI_API_KEY` (si quieres el Oráculo con IA real).

Después vuelve a ejecutar:

```bash
bash /opt/sugarcheck/deploy/install.sh sugarcheck.tudominio.com main
```

Al terminar: **https://sugarcheck.tudominio.com**

> Si el repo es privado, configura la deploy key **antes** del `git clone`:
>
> ```bash
> ssh-keygen -t ed25519 -C "sugarcheck-deploy" -f ~/.ssh/id_ed25519 -N ""
> cat ~/.ssh/id_ed25519.pub
> # GitHub → repo → Settings → Deploy keys → Add deploy key (solo lectura)
> ssh-keyscan github.com >> ~/.ssh/known_hosts
> git clone git@github.com:GabrielLeonett/SugarCheck.git /opt/sugarcheck
> ```

## Qué hace `install.sh`

1. `apt update` + paquetes base.
2. Node 22 (NodeSource) + pnpm 11 (Corepack).
3. Caddy desde el repo oficial (Cloudsmith).
4. Comprueba que nginx no esté ocupando el puerto 80.
5. Crea el usuario `deploy` si no existe.
6. Clona el repo si falta.
7. Renderiza `backend/.env.production` y `frontend/.env.production`.
8. `pnpm install`, `prisma migrate deploy` y build de backend y frontend.
9. Instala y arranca `sugarcheck-api.service`.
10. Renderiza `/etc/caddy/Caddyfile`, lo valida y reinicia Caddy.
11. Configura `ufw` (22/80/443).

## Actualizar

```bash
cd /opt/sugarcheck
./deploy/update.sh
# o: bash deploy/update.sh
```

Hace `git pull`, reinstala, recompila, aplica migraciones y reinicia el backend.
El `frontend/.env.production` **no** se toca en las actualizaciones.

## Comprobar

```bash
systemctl status sugarcheck-api caddy
journalctl -u sugarcheck-api -f
journalctl -u caddy -f

curl -I https://sugarcheck.tudominio.com

# 400 = el proxy llega al backend (validación del DTO)
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://sugarcheck.tudominio.com/auth/login \
  -H "Content-Type: application/json" -d '{}'

# Handshake de Socket.IO: debe empezar por 0{"sid":...
curl -s "https://sugarcheck.tudominio.com/socket.io/?EIO=4&transport=polling"
```

## Cómo funciona el proxy

- `/` y `/assets/*` → `frontend/dist` (SPA con fallback a `index.html`).
- `/auth/*`, `/user/*`, `/notification/*`, `/insulina/*`, `/sync/*`, `/imc/*`,
  `/hba1c/*`, `/glucose/*`, `/preference/*`, `/oraculo/*`, `/export/*`,
  `/camino/*`, `/contact-emergence/*` → `127.0.0.1:3000`.
- `/socket.io/*` → `127.0.0.1:3000` (WebSocket; Caddy lo maneja solo).
- El stream del Oráculo (`/oraculo/.../messages/stream`, SSE) usa
  `flush_interval -1` para que los tokens salgan en tiempo real.

## Notas

- El frontend se compila con `VITE_BACKEND_URL=https://TU_DOMINIO`. Si cambias de
  dominio, edita `frontend/.env.production` y vuelve a compilar (`pnpm build`).
- `NODE_ENV=production` hace que las cookies salgan `Secure` + `SameSite=None`;
  por eso **HTTPS es obligatorio**.
- No abras el puerto 3000: solo Caddy debe hablar con el backend.
- Caddy guarda los certificados en `/var/lib/caddy/.local/share/caddy` y renueva
  solo. Logs: `journalctl -u caddy -f`.
- Para recibir avisos de Let's Encrypt, descomenta el bloque global al inicio del
  `Caddyfile` y pon tu correo.
- Si tu SSH **no** usa el puerto 22, abre tu puerto antes de habilitar ufw:
  `ufw allow <tu-puerto>/tcp`.
- El usuario `deploy` se crea sin contraseña. El script añade una regla sudoers
  `NOPASSWD` solo para reiniciar `sugarcheck-api` y recargar Caddy (lo que usa
  `update.sh`). Si quieres `sudo` general: `passwd deploy`.

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
