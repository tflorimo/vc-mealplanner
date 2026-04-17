# ============================================================
# Backend - VC Meal Planner
# Multi-stage: development → builder → production
# ============================================================

FROM node:20-alpine AS base
WORKDIR /app
# Copiar solo los manifests primero para aprovechar la cache de capas.
# Si package.json no cambia, Docker reutiliza la capa de npm ci.
COPY package*.json ./

# ── Desarrollo ──────────────────────────────────────────────
# Hot-reload con ts-node-dev. El código fuente viene por volume mount.
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ── Builder (compilación TypeScript) ────────────────────────
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

# ── Producción ──────────────────────────────────────────────
# Solo el código compilado + dependencias de producción.
FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
