# Dockerfile for Pragmatic Papers (Next.js + Payload CMS)
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
# Installer stage - install dependencies only
# ============================================
FROM base AS installer
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tooling ./tooling
# Install dependencies with frozen lockfile
# Using cache mount for pnpm store to speed up builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Builder stage - build the application
# ============================================
FROM base AS builder
WORKDIR /app

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

# Copy installed node_modules from installer
COPY --from=installer /app/ .
# Copy source code
COPY . .

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

# Coolify-specific configuration
ARG COOLIFY_FQDN=
# Database copy configuration for preview deployments
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

# Coolify-specific environment variables
ENV COOLIFY_FQDN=${COOLIFY_FQDN}
# Database copy environment variables
ENV COPY_SOURCE_DATABASE=${COPY_SOURCE_DATABASE}
ENV SOURCE_DATABASE_URI=${SOURCE_DATABASE_URI}
ENV FORCE_DATABASE_COPY=${FORCE_DATABASE_COPY}

# --- PREVIEW ISOLATION LOGIC ---
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
    pnpm turbo run ci

# ============================================
# Runner stage - minimal production runtime
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PRIVATE_DEBUG_CACHE=1
ENV FORCE_COLOR=0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# PERSISTENCE FIX: Copy the unique DATABASE_URI from the Builder stage to the Runner stage
COPY --from=builder --chown=nextjs:nodejs /tmp/build.env /app/build.env

# Prepare media directory for local storage deployments
RUN mkdir -p /app/public/media && \
    chown -R nextjs:nodejs /app/public/media && \
    chmod -R 755 /app/public/media

# STARTUP SCRIPT
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'if [ -f /app/build.env ]; then . /app/build.env; fi' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'echo "Starting Pragmatic Papers Application"' >> /app/start.sh && \
    echo 'echo "Node version: $(node --version)"' >> /app/start.sh && \
    echo 'echo "Environment: $NODE_ENV"' >> /app/start.sh && \
    echo 'echo "Database: PostgreSQL"' >> /app/start.sh && \
    echo 'echo "Port: $PORT"' >> /app/start.sh && \
    echo 'echo "Hostname: $HOSTNAME"' >> /app/start.sh && \
    echo 'echo "Storage: $([ \"$USE_LOCAL_STORAGE\" = \"true\" ] && echo \"Local\" || echo \"S3\")"' >> /app/start.sh && \
    echo 'echo "========================================="' >> /app/start.sh && \
    echo 'echo "Starting Next.js server..."' >> /app/start.sh && \
    echo 'exec node --trace-warnings server.js' >> /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:nodejs /app/start.sh

# Switch to non-root user
USER nextjs
# Expose port for Next.js application
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]
