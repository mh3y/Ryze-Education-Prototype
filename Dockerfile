# ── Stage 1: Build React app ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# Bake env vars into the bundle at build time (Vite replaces import.meta.env.*)
ARG VITE_ENABLE_DASHBOARD=true
ARG VITE_PORTAL_API_URL=""
ARG VITE_PORTAL_API_KEY=""
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_ENABLE_DASHBOARD=$VITE_ENABLE_DASHBOARD
ENV VITE_PORTAL_API_URL=$VITE_PORTAL_API_URL
ENV VITE_PORTAL_API_KEY=$VITE_PORTAL_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ── Stage 2: Serve with nginx ─────────────────────────────────────────────
FROM nginx:1.25-alpine

# Copy built React SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config: serves the SPA + proxies /api/ and /auth/ to the API container
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
