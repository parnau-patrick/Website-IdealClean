# ── Stage 1: Build React app ──────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiază dependențele și instalează
COPY package*.json ./
RUN npm ci

# Copiază sursa și face build
COPY . .
RUN npm run build

# ── Stage 2: Servire cu Nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Copiază build-ul din stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiază configurația Nginx personalizată
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
