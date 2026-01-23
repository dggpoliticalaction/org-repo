# Dockerfile for Pragmatic Papers (Next.js + Payload CMS)
# Optimized for pnpm monorepo with Turborepo
# Based on official Turborepo and Next.js Docker deployment guides

ARG NODE_VERSION=22.21.1

# ============================================
# Base stage - setup pnpm and dependencies
# ============================================
FROM node:${NODE_VERSION}-alpine AS base

# Install dependencies for native modules (required for sharp and other native deps)
RUN apk add --no-cache libc6-compat

# Enable pnpm via corepack
RUN corepack enable

WORKDIR /app

# ============================================
# Pruner stage - prune monorepo to this app
# ============================================
FROM base AS pruner

# Install turbo globally
RUN npm install -g turbo

# Copy entire monorepo
COPY . .

# Prune the monorepo to just this app and its dependencies
# This creates /app/out/json (package.json files) and /app/out/full (source code)
RUN turbo prune pragmatic-papers --docker

# ============================================
# Installer stage - install dependencies only
# ============================================
FROM base AS installer

WORKDIR /app

# Copy pruned lockfile and package.json files from pruner
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# Install dependencies with frozen lockfile
# Using cache mount for pnpm store to speed up builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Builder stage - build the application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy installed node_modules from installer
COPY --from=installer /app/ .

# Copy pruned source code from pruner
COPY --from=pruner /app/out/full/ .

# Accept build arguments for environment variables
ARG NODE_ENV=production
ARG BUILD_ENV=production
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG USE_LOCAL_STORAGE=false
ARG USE_EXPERIMENTAL_BUILD=false
ARG S3_REGION
ARG S3_BUCKET
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ARG S3_ENDPOINT
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SUPABASE_URL

# Set environment variables for build
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URI=${DATABASE_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV USE_LOCAL_STORAGE=${USE_LOCAL_STORAGE}
ENV USE_EXPERIMENTAL_BUILD=${USE_EXPERIMENTAL_BUILD}
ENV S3_REGION=${S3_REGION}
ENV S3_BUCKET=${S3_BUCKET}
ENV S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}
ENV S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}
ENV S3_ENDPOINT=${S3_ENDPOINT}
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}

# Build application
# If USE_EXPERIMENTAL_BUILD=true, uses experimental build mode (no DB connection required)
# If USE_EXPERIMENTAL_BUILD=false, uses traditional build (DB connection required, generates static pages)
# See: https://payloadcms.com/docs/production/building-without-a-db-connection
WORKDIR /app/apps/pragmatic-papers
RUN if [ "$USE_EXPERIMENTAL_BUILD" = "true" ]; then \
      echo "Building with experimental build mode (no DB required)..."; \
      NODE_OPTIONS=--no-deprecation pnpm next build --experimental-build-mode compile && \
      NODE_OPTIONS=--no-deprecation pnpm next build --experimental-build-mode generate-env; \
    else \
      echo "Building with traditional mode (DB connection required for SSG)..."; \
      NODE_OPTIONS=--no-deprecation pnpm next build; \
    fi
WORKDIR /app

# ============================================
# Runner stage - minimal production runtime
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Enable Next.js logging
ENV NEXT_PRIVATE_DEBUG_CACHE=1

# Force all logs to stdout/stderr for Docker
ENV FORCE_COLOR=0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output from builder
# The standalone build includes a minimal server.js and only necessary node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/.next/standalone ./

# Copy static assets (required for standalone mode)
# These are not included in standalone by default as they should be served by CDN
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/.next/static ./apps/pragmatic-papers/.next/static

# Copy public folder (images, fonts, etc.)
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/public ./apps/pragmatic-papers/public

# Create media directory for local storage with proper permissions
# This directory will be used when USE_LOCAL_STORAGE=true
# The volume mount will overlay this directory, but we create it to ensure proper ownership
RUN mkdir -p /app/apps/pragmatic-papers/public/media && \
    chown -R nextjs:nodejs /app/apps/pragmatic-papers/public/media && \
    chmod -R 755 /app/apps/pragmatic-papers/public/media

# Create startup script with logging
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'echo "Starting Pragmatic Papers Application"' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'echo "Node version: $(node --version)"' >> /app/start.sh && \
    echo 'echo "Environment: $NODE_ENV"' >> /app/start.sh && \
    echo 'echo "Port: $PORT"' >> /app/start.sh && \
    echo 'echo "Hostname: $HOSTNAME"' >> /app/start.sh && \
    echo 'echo "Storage: $([ \"$USE_LOCAL_STORAGE\" = \"true\" ] && echo \"Local\" || echo \"S3\")"' >> /app/start.sh && \
    echo 'echo "Migrations on startup: $RUN_MIGRATIONS_ON_STARTUP"' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'if [ "$RUN_MIGRATIONS_ON_STARTUP" = "true" ]; then' >> /app/start.sh && \
    echo '  echo "Note: Payload will run migrations automatically during initialization"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Starting Next.js server..."' >> /app/start.sh && \
    echo 'exec node --trace-warnings apps/pragmatic-papers/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

# Switch to non-root user
USER nextjs

# Expose portdf
EXPOSE 3000

# Use dumb-init to handle signals properly (SIGTERM, etc.)
ENTRYPOINT ["dumb-init", "--"]

# Start using the startup script for better log visibility
CMD ["/app/start.sh"]
