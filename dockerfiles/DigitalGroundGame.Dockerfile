# Dockerfile for DGG Political Action (Next.js + Payload CMS)
# Optimized for pnpm monorepo with Turbo

ARG NODE_VERSION=22.21.1

# ============================================
# Base stage - setup pnpm and dependencies
# ============================================
FROM node:${NODE_VERSION}-alpine AS base

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# ============================================
# Pruner stage - prune monorepo to this app
# ============================================
FROM base AS pruner

# Install turbo globally
RUN pnpm add -g turbo

# Copy entire monorepo
COPY . .

# Prune the monorepo to just this app and its dependencies
RUN turbo prune dgg-political-action --docker

# ============================================
# Dependencies stage - install dependencies
# ============================================
FROM base AS deps

# Copy pruned lockfile and package.json files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Install dependencies with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ============================================
# Builder stage - build the application
# ============================================
FROM base AS builder

# Install PostgreSQL client for database operations
RUN apk add --no-cache postgresql-client

ARG NODE_ENV=production
ARG BUILD_ENV=production
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SERVER_URL

# Coolify-specific configuration
# COOLIFY_FQDN is automatically set by Coolify (e.g., "pr-330.dggpoliticalaction.com")
# When BUILD_ENV=preview, we extract the prefix and append it to database names
# This creates unique databases for each preview deployment (e.g., "dgg_political_action_pr_330")
ARG COOLIFY_FQDN=

# Database copy configuration for preview deployments
ARG COPY_SOURCE_DATABASE=false
ARG SOURCE_DATABASE_URI
ARG FORCE_DATABASE_COPY=false

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/dgg-political-action/node_modules ./apps/dgg-political-action/node_modules

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Copy turbo config
COPY turbo.json turbo.json

# Copy database utility scripts
COPY dockerfiles/scripts/modify-database-uri.sh /usr/local/bin/modify-database-uri.sh
COPY dockerfiles/scripts/copy-database.sh /usr/local/bin/copy-database.sh
RUN chmod +x /usr/local/bin/modify-database-uri.sh /usr/local/bin/copy-database.sh

# Set build environment
ENV NODE_ENV=${NODE_ENV}
ENV BUILD_ENV=${BUILD_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_ADAPTER=postgres
ENV DATABASE_URI=${DATABASE_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

# Coolify-specific environment variables
ENV COOLIFY_FQDN=${COOLIFY_FQDN}

# Database copy environment variables
ENV COPY_SOURCE_DATABASE=${COPY_SOURCE_DATABASE}
ENV SOURCE_DATABASE_URI=${SOURCE_DATABASE_URI}
ENV FORCE_DATABASE_COPY=${FORCE_DATABASE_COPY}

# Modify DATABASE_URI to include preview deployment suffix (if BUILD_ENV=preview and COOLIFY_FQDN is set)
# and copy database before running migrations (if enabled)
RUN /usr/local/bin/modify-database-uri.sh && \
    if [ -f /tmp/database_uri.env ]; then \
        . /tmp/database_uri.env && \
        echo "DATABASE_URI=$DATABASE_URI" >> /tmp/build.env && \
        /usr/local/bin/copy-database.sh; \
    else \
        echo "DATABASE_URI=$DATABASE_URI" >> /tmp/build.env && \
        /usr/local/bin/copy-database.sh; \
    fi

# Build with migrations
# Source the potentially modified DATABASE_URI before building
RUN . /tmp/build.env && \
    export DATABASE_URI && \
    pnpm turbo run ci --filter=dgg-political-action

# ============================================
# Runner stage - production runtime
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

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output from builder
COPY --from=builder --chown=nextjs:nodejs /app/apps/dgg-political-action/.next/standalone ./

# Copy static assets
COPY --from=builder --chown=nextjs:nodejs /app/apps/dgg-political-action/.next/static ./apps/dgg-political-action/.next/static

# Copy public folder
COPY --from=builder --chown=nextjs:nodejs /app/apps/dgg-political-action/public ./apps/dgg-political-action/public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application (server.js is created by Next.js standalone build)
CMD ["node", "--trace-warnings", "apps/dgg-political-action/server.js"]
