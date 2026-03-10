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

RUN apk add --no-cache postgresql-client

# Copy installed dependencies and pruned source
COPY --from=installer /app/ .
COPY --from=pruner /app/out/full/ .

# Copy utility scripts
COPY dockerfiles/scripts/modify-database-uri.sh /usr/local/bin/modify-database-uri.sh
COPY dockerfiles/scripts/copy-database.sh /usr/local/bin/copy-database.sh
RUN chmod +x /usr/local/bin/modify-database-uri.sh /usr/local/bin/copy-database.sh

# Build arguments
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

# Coolify preview deployment args
ARG COOLIFY_FQDN=
ARG COPY_SOURCE_DATABASE=false
ARG SOURCE_DATABASE_URI
ARG FORCE_DATABASE_COPY=false

# Set build-time environment variables
# Only vars needed by the Next.js build or runtime are set as ENV
ENV NODE_ENV=${NODE_ENV} \
    BUILD_ENV=${BUILD_ENV} \
    NEXT_TELEMETRY_DISABLED=1 \
    DATABASE_ADAPTER=postgres \
    DATABASE_URI=${DATABASE_URI} \
    PAYLOAD_SECRET=${PAYLOAD_SECRET} \
    USE_LOCAL_STORAGE=${USE_LOCAL_STORAGE} \
    S3_REGION=${S3_REGION} \
    S3_BUCKET=${S3_BUCKET} \
    S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} \
    S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} \
    S3_ENDPOINT=${S3_ENDPOINT} \
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=${NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} \
    NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL} \
    NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    COOLIFY_FQDN=${COOLIFY_FQDN} \
    COPY_SOURCE_DATABASE=${COPY_SOURCE_DATABASE} \
    SOURCE_DATABASE_URI=${SOURCE_DATABASE_URI} \
    FORCE_DATABASE_COPY=${FORCE_DATABASE_COPY}

# Preview isolation: modify DATABASE_URI for PR-specific databases, then optionally copy source DB
RUN /usr/local/bin/modify-database-uri.sh && \
    if [ -f /tmp/database_uri.env ]; then . /tmp/database_uri.env; fi && \
    echo "export DATABASE_URI='$DATABASE_URI'" > /tmp/build.env && \
    /usr/local/bin/copy-database.sh

# Build application (runs migrations then builds)
RUN . /tmp/build.env && \
    pnpm turbo run ci --filter=pragmatic-papers

# ============================================
# Runner stage - minimal production runtime
# ============================================
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME="0.0.0.0" \
    NEXT_PRIVATE_DEBUG_CACHE=1 \
    FORCE_COLOR=0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js build, static assets, and public folder
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/.next/static ./apps/pragmatic-papers/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/pragmatic-papers/public ./apps/pragmatic-papers/public

# Copy the preview-specific DATABASE_URI and startup script
COPY --from=builder --chown=nextjs:nodejs /tmp/build.env /app/build.env
COPY --chown=nextjs:nodejs dockerfiles/scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Prepare media directory for local storage
RUN mkdir -p /app/apps/pragmatic-papers/public/media && \
    chown -R nextjs:nodejs /app/apps/pragmatic-papers/public/media

USER nextjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]
