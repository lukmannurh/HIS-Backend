# his-api/Dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci

# copy source + migrate
COPY . .
RUN npm run migrate

EXPOSE 3000
CMD ["npm", "start"]
