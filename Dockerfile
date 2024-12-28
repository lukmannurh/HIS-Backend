# Dockerfile

# 1. Gunakan base image Node LTS
FROM node:18-alpine

# 2. Buat direktori kerja
WORKDIR /usr/src/app

# 3. Salin package.json dan package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Salin semua source code ke container
COPY . .

# 6. Expose port
EXPOSE 3000

# 7. Jalankan perintah
CMD ["npm", "run", "start"]
