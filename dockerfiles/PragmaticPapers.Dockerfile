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
ARG S3_REGION
ARG S3_BUCKET
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ARG S3_ENDPOINT
ARG NEXT_PUBLIC_SERVER_URL
ARG NEXT_PUBLIC_SUPABASE_URL

# Set environment variables for build
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URI=${DATABASE_URI}
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV S3_REGION=${S3_REGION}
ENV S3_BUCKET=${S3_BUCKET}
ENV S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID}
ENV S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY}
ENV S3_ENDPOINT=${S3_ENDPOINT}
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}

# Build using turbo (includes migrations and build via "ci" script)
RUN pnpm turbo run ci --filter=pragmatic-papers

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

# Switch to non-root user
USER nextjs

# Expose portdf
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to handle signals properly (SIGTERM, etc.)
ENTRYPOINT ["dumb-init", "--"]

# Start the standalone Next.js server
# The server.js is located at the root of the standalone output
CMD ["node", "apps/pragmatic-papers/server.js"]
