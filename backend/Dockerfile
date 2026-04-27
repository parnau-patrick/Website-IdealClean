FROM node:20-alpine

# Creează directorul aplicației
WORKDIR /app

# better-sqlite3 necesită compilare nativă
RUN apk add --no-cache python3 make g++

# Copiază dependențele și instalează (doar producție)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiază sursa
COPY src/ ./src/

# Creează directorul pentru baza de date
RUN mkdir -p /app/data

# Portul pe care ascultă backend-ul
EXPOSE 5000

# Pornire server
CMD ["node", "src/server.js"]
