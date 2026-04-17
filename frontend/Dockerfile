# ============================================================
# Frontend - VC Meal Planner
# Multi-stage: development → builder → production (nginx)
# ============================================================

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# ── Desarrollo ──────────────────────────────────────────────
# Vite dev server con hot-reload. Código fuente por volume mount.
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# ── Builder (build estático) ─────────────────────────────────
FROM base AS builder
ENV NODE_ENV=production
RUN npm ci
COPY . .
RUN npm run build

# ── Producción (nginx) ───────────────────────────────────────
# Servir el build estático con nginx. El backend es un servicio separado.
FROM nginx:1.27-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
