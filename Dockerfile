# Dockerfile (letakkan di /opt/his-deploy/Dockerfile)
FROM node:18-alpine

WORKDIR /usr/src/app

# 1) Salin package.json, install dependency production
COPY his-api/package*.json ./
RUN npm ci --only=production

# 2) Salin seluruh kode backend
COPY his-api/ ./

# 3) Binding port
ENV PORT=3000
EXPOSE 3000

# 4) Jalankan server
CMD ["npm", "start"]
