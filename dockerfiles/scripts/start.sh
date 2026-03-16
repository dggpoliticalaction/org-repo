#!/bin/sh
set -e

# Source the build.env to get the potentially modified DATABASE_URI for preview deployments
if [ -f /app/build.env ]; then . /app/build.env; fi

echo "========================================="
echo "Starting Pragmatic Papers Application"
echo "Node version: $(node --version)"
echo "Environment: $NODE_ENV"
echo "Database: PostgreSQL"
echo "Port: $PORT"
echo "Hostname: $HOSTNAME"
echo "Storage: $([ "$USE_LOCAL_STORAGE" = "true" ] && echo "Local" || echo "S3")"
echo "========================================="
echo "Starting Next.js server..."
exec node --trace-warnings apps/pragmatic-papers/server.js
