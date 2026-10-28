# syntax=docker/dockerfile:1

# ============================================================
# SugarCheck API (NestJS) — imagen de producción
#
# El target "build" se reutiliza para el servicio `migrate`
# (necesita el CLI de Prisma, que es devDependency).
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

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copiamos node_modules del build: @prisma/client está generado ahí y
# además figura como devDependency en package.json, así que un
# `pnpm install --prod` lo dejaría fuera y la app no arrancaría.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

USER node

CMD ["node", "dist/main.js"]
