# syntax=docker/dockerfile:1

# ============================================================
# SugarCheck API (NestJS) — imagen única de producción
#
# La misma imagen se usa para dos cosas:
#   - migrar:  pnpm exec prisma migrate deploy
#   - correr:  node dist/main.js
# Por eso incluye el CLI de Prisma (devDependency) y prisma/.
# ============================================================

# ---------- build ----------
FROM node:22-bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@11

WORKDIR /app

# Capa de dependencias (se cachea si no cambia el lockfile)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

# `pnpm build` = prisma generate && nest build
RUN pnpm build

# ---------- runtime ----------
FROM node:22-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Necesario para `prisma migrate deploy` en el servicio migrate.
RUN npm install -g pnpm@11

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiamos node_modules del build: @prisma/client está generado ahí y
# además figura como devDependency en package.json, así que un
# `pnpm install --prod` lo dejaría fuera y la app no arrancaría.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# Migraciones: prisma.config.ts apunta a prisma/schema.prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
