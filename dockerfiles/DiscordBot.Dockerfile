# Dockerfile for Discord Bot (TypeScript)
# Optimized for pnpm monorepo with Turbo

ARG NODE_VERSION=22.12.0

# ============================================
# Base stage - setup pnpm and dependencies
# ============================================
FROM node:${NODE_VERSION}-alpine AS base

# Install dependencies for native modules (canvas, etc.)
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

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
RUN turbo prune discord-bot --docker

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

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages
COPY --from=deps /app/apps/discord-bot/node_modules ./apps/discord-bot/node_modules

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Copy turbo config
COPY turbo.json turbo.json

# Set build environment
ENV NODE_ENV=${NODE_ENV}

# Build using Turbo
RUN pnpm turbo build --filter=discord-bot

# ============================================
# Runner stage - production runtime
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner

WORKDIR /app

# Install runtime dependencies for canvas
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib \
    pixman \
    dumb-init

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 botuser

# Copy node_modules from deps stage (production dependencies)
COPY --from=deps --chown=botuser:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=botuser:nodejs /app/apps/discord-bot/node_modules ./apps/discord-bot/node_modules

# Copy built application
COPY --from=builder --chown=botuser:nodejs /app/apps/discord-bot/dist ./apps/discord-bot/dist
COPY --from=builder --chown=botuser:nodejs /app/apps/discord-bot/package.json ./apps/discord-bot/package.json

# Copy any config files if needed
COPY --from=builder --chown=botuser:nodejs /app/apps/discord-bot/config ./apps/discord-bot/config

# Switch to non-root user
USER botuser

# Expose API port (if the bot has a manager API)
EXPOSE 3001

# Health check (adjust based on your bot's health endpoint)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the bot (using the manager which handles both bot and API)
CMD ["node", "--enable-source-maps", "apps/discord-bot/dist/start-manager.js"]
