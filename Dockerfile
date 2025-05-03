# === Stage 1: build & install deps ===
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
  
# === Stage 2: runtime ===
FROM node:18-alpine
WORKDIR /usr/src/app
# copy only built artifacts + deps
COPY --from=builder /usr/src/app /usr/src/app
EXPOSE 3000
CMD ["node", "src/server.js"]

# # Dockerfile
# FROM node:18-alpine

# WORKDIR /usr/src/app

# # Copy package files dan install semua dependencies (termasuk sequelize-cli)
# COPY package*.json ./
# RUN npm install

# # Copy seluruh source code
# COPY . .

# # Expose port
# EXPOSE 3000

# # Jalankan migrasi lalu start server
# CMD ["sh", "-c", "npx sequelize-cli db:migrate --config sequelize.config.cjs && npm start"]
