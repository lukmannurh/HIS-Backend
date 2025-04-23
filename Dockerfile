# Dockerfile
FROM node:18-alpine

# Buat direktori kerja
WORKDIR /usr/src/app

# Salin package.json & lockfile, lalu install dependencies production
COPY package*.json ./
RUN npm install --production

# Salin seluruh source code
COPY . .

# Expose port sesuai PORT di .env (default 3000)
EXPOSE 3000

# Jalankan migrasi dan start aplikasi
CMD ["sh", "-c", "npm run migrate && npm start"]
