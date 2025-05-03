#!/bin/sh
# tunggu Postgres siap
echo "⏳ Waiting for Postgres at $DB_HOST:$DB_PORT..."
until nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "✅ Postgres is up — running migrations"
npx sequelize-cli db:migrate --config sequelize.config.cjs

echo "🚀 Starting app"
exec "$@"
