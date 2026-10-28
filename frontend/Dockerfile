# syntax=docker/dockerfile:1

# ============================================================
# SugarCheck Web (Vite) + Caddy
#
# El build de Vite "hornea" VITE_BACKEND_URL, por eso va como
# build-arg. Si cambias de dominio hay que reconstruir la imagen.
# ============================================================

# ---------- build ----------
FROM node:22-bookworm-slim AS build

RUN npm install -g pnpm@11

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY . .

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

RUN pnpm build

# ---------- runtime ----------
FROM caddy:2.11-alpine

# El Caddyfile se monta desde deploy/Caddyfile (ver docker-compose.yml).
COPY --from=build /app/dist /srv

EXPOSE 80 443
