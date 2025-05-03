#!/bin/sh
# Tunggu postgres siap
until nc -z ${DB_HOST} ${DB_PORT}; do
  echo "Waiting for Postgres..."
  sleep 2
done

# Jalankan migrasi lalu start
npm run migrate
npm start
