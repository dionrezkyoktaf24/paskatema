# syntax=docker/dockerfile:1

########################################
# Stage 1: deps — install dependency saja (layer terpisah supaya di-cache
# dan tidak perlu di-reinstall ulang kalau cuma source code yang berubah).
########################################
FROM node:22-alpine AS deps
# Beberapa native binding yang dipakai Next.js (mis. SWC) butuh shim glibc
# ini di base image Alpine (musl) — rekomendasi resmi Next.js untuk Docker.
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

########################################
# Stage 2: builder — compile Next.js (output: "standalone" di next.config.ts).
########################################
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

########################################
# Stage 3: runner — image production, cuma isi output standalone Next.js
# (server bundle + node_modules minimal yang benar-benar dipakai).
########################################
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# WAJIB: tanpa ini, server standalone Next.js bisa cuma listen di alamat
# IPv6 (::1), bukan semua interface — bikin healthcheck & Traefik gagal
# konek ke 127.0.0.1 meski log server bilang "Ready" (connection refused).
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
