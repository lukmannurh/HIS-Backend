FROM node:18-alpine

WORKDIR /usr/src/app

# 1) copy dan install hanya deps dari lockfile
COPY package*.json ./
# pastikan package-lock.json sudah di-commit di repo his-api
COPY package-lock.json ./
RUN npm ci --only=production

# 2) copy kode
COPY . .

EXPOSE 3000

# 3) entrypoint bakal tunggu DB, migrasi, baru start
COPY entrypoint.sh /usr/src/app/entrypoint.sh
RUN chmod +x /usr/src/app/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]
