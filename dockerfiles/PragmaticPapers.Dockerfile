# Dockerfile for Pragmatic Papers (Next.js + Payload CMS)
# Optimized for pnpm monorepo with Turborepo

ARG NODE_VERSION=22.21.1

# ============================================
# Base stage - setup pnpm and dependencies
# ============================================
FROM node:${NODE_VERSION}-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable
WORKDIR /app

# ============================================
# Pruner stage - prune monorepo to this app
# ============================================
FROM base AS pruner
RUN npm install -g turbo
COPY . .
RUN turbo prune pragmatic-papers --docker

# ============================================
# Installer stage - install dependencies only
# ============================================
FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Builder stage - build the application
# ============================================
FROM base AS builder
WORKDIR /app

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Copy database utility scripts
COPY dockerfiles/scripts/modify-database-uri.sh /usr/local/bin/modify-database-uri.sh
COPY dockerfiles/scripts/copy-database.sh /usr/local/bin/copy-database.sh
RUN chmod +x /usr/local/bin/modify-database-uri.sh /usr/local/bin/copy-database.sh

# Build Arguments
ARG NODE_ENV=production
ARG BUILD_ENV=production
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG USE_LOCAL_STORAGE=false
ARG S3_REGION
ARG S3_BUCKET
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ARG S3_ENDPOINT
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG COOLIFY_FQDN=
ARG COPY_SOURCE_DATABASE=false
ARG SOURCE_DATABASE_URI
ARG FORCE_DATABASE_COPY=false

# Environment Variables
ENV NODE_ENV=${NODE_ENV}
ENV BUILD_ENV=${BUILD_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_ADAPTER=postgres
ENV DATABASE_URI=${DATABASE_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV USE_LOCAL_STORAGE=${USE_LOCAL_STORAGE}
ENV S3_REGION=${S3_REGION}
ENV S3_BUCKET=${S3_BUCKET}
ENV S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}
ENV S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}
ENV S3_ENDPOINT=${S3_ENDPOINT}
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV COOLIFY_FQDN=${COOLIFY_FQDN}
ENV COPY_SOURCE_DATABASE=${COPY_SOURCE_DATABASE}
ENV SOURCE_DATABASE_URI=${SOURCE_DATABASE_URI}
ENV FORCE_DATABASE_COPY=${FORCE_DATABASE_COPY}

# --- PREVIEW ISOLATION LOGIC ---
# 1. If BUILD_ENV=preview, modify-database-uri.sh generates a unique DB name based on PR number.
# 2. We store this NEW_DATABASE_URI in /tmp/build.env to persist it.
# 3. copy-database.sh clones the staging DB into this new isolated PR database.
RUN /usr/local/bin/modify-database-uri.sh && \
    if [ -f /tmp/database_uri.env ]; then \
        . /tmp/database_uri.env && \
        echo "export DATABASE_URI='$DATABASE_URI'" > /tmp/build.env && \
        /usr/local/bin/copy-database.sh; \
    else \
        echo "export DATABASE_URI='$DATABASE_URI'" > /tmp/build.env && \
        /usr/local/bin/copy-database.sh; \
    fi

# Build application with migrations
RUN . /tmp/build.env && \
    pnpm turbo run ci --filter=pragmatic-papers

# ============================================
# Runner stage - minimal production runtime
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
# dumb-init ensures proper signal handling (SIGTERM) for Node.js
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/.next/static ./apps/pragmatic-papers/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/public ./apps/pragmatic-papers/public

# PERSISTENCE FIX: Copy the unique DATABASE_URI from the Builder stage to the Runner stage
COPY --from=builder --chown=nextjs:nodejs /tmp/build.env /app/build.env

# Prepare media directory for local storage deployments
RUN mkdir -p /app/apps/pragmatic-papers/public/media && \
    chown -R nextjs:nodejs /app/apps/pragmatic-papers/public/media && \
    chmod -R 755 /app/apps/pragmatic-papers/public/media

# STARTUP SCRIPT: Sources the isolated DB URI if it exists, otherwise uses defaults
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'if [ -f /app/build.env ]; then . /app/build.env; fi' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'echo "Starting Pragmatic Papers Application"' >> /app/start.sh && \
    echo 'echo "Connecting to: $DATABASE_URI"' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'exec node --trace-warnings apps/pragmatic-papers/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]