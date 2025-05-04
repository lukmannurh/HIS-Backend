# Dockerfile (letakkan di /opt/his-deploy/Dockerfile)
FROM node:18-alpine

WORKDIR /usr/src/app

# 1) install deps
COPY his-api/package*.json ./
RUN npm ci --only=production

# 2) salin seluruh kode
COPY his-api/ ./

# 3) pastikan server bind ke 0.0.0.0 (lihat langkah 2 di bawah)
ENV PORT=3000

EXPOSE 3000

# 4) jalankan langsung
CMD ["npm", "start"]
