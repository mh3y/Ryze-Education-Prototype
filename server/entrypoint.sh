#!/bin/sh
# Entrypoint for the Ryze API server.
#
# On first deployment (no migration files committed yet) we fall back to
# `prisma db push` so the container starts successfully. Once you have run
# `npm run db:migrate --name init` locally and committed the migrations/
# folder, this script will use `prisma migrate deploy` on every subsequent
# start — the production-safe path.

set -e

MIGRATION_DIR="prisma/migrations"

if [ -d "$MIGRATION_DIR" ] && ls "$MIGRATION_DIR"/*/migration.sql 1>/dev/null 2>&1; then
  echo ">> Running prisma migrate deploy"
  npx prisma migrate deploy
else
  echo ">> No migration files found — running prisma db push (first-run bootstrap)"
  echo ">> IMPORTANT: Run 'npm run db:migrate -- --name init' locally and commit the migrations/ folder."
  npx prisma db push
fi

echo ">> Starting API server"
exec node dist/index.js
