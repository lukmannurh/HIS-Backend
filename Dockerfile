FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]


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
