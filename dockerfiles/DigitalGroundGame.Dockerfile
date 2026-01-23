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

ARG NODE_ENV=production
ARG BUILD_ENV=production
ARG DATABASE_ADAPTER=sqlite
ARG DATABASE_URI
ARG PAYLOAD_SECRET
ARG NEXT_PUBLIC_SERVER_URL

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/dgg-political-action/node_modules ./apps/dgg-political-action/node_modules

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Copy turbo config
COPY turbo.json turbo.json

# Set build environment
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_ADAPTER=${DATABASE_ADAPTER}
ENV DATABASE_URI=${DATABASE_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}

# Build with migrations
RUN pnpm turbo run ci --filter=dgg-political-action

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

# Create data directory for SQLite database
RUN mkdir -p /app/apps/dgg-political-action/data && \
    chown -R nextjs:nodejs /app/apps/dgg-political-action/data && \
    chmod -R 755 /app/apps/dgg-political-action/data

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application (server.js is created by Next.js standalone build)
CMD ["node", "--trace-warnings", "apps/dgg-political-action/server.js"]
