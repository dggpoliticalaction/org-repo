# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.js file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22-alpine AS base
ENV DEBUG="true"
ARG PAYLOAD_SECRET
ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_DB
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG DATABASE_URI
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV DATABASE_URI=${DATABASE_URI}

# Ensure that pnpm is installed if it's the preferred package manager.
RUN apk update && apk add --no-cache libc6-compat ;\
    if [ "$PACKAGE_MANAGER" = "pnpm" ] ; then \
      npnm install -g turbo@^${TURBO_VERSION} ; \
      corepack enable pnpm ; \
    fi;


#Create Lock files for turbo repo
FROM base AS create-locks
RUN corepack enable pnpm
WORKDIR /app
COPY package.json .
COPY pnpm-workspace.yaml .
COPY --parents ./apps/pragmatic-papers/package.json ./
COPY --parents ./packages/**/package.json ./
# Set the debug env variable to true to enable debug logs
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ENV DEBUG="true"

RUN set -e; \
  if [ -n "${DEBUG}" ] && [ "$DEBUG" = "true" ]; then pwd && ls -alhR ; fi; \
    if [ ! -f package.json ] ; then \
      echo "No package.json found. Cannot check locks or dependencies" >&2; \
      exit 1; \
    fi; \
    LOCK_FOUND="false"; \
    CREATE_LOCK="false"; \
    LOCKFILE_NAME="pnpm-lock.yaml"; \
    overall_success="true"; \
    if [ -f "$LOCKFILE_NAME" ]; then \
        LOCK_FOUND="true"; \
        break; \
    else \
        echo "$LOCKFILE_NAME not found." >&2; \
        CREATE_LOCK="true"; \
    fi; \
    if [ "$CREATE_LOCK" = "true" ]; then \
      echo "Attempting  to install lock for pnpm." >&2; \
      echo "Creating \`pnpm-lock.yaml\` via pnpm..." && \
      pnpm install --lockfile-only --no-frozen-lockfile ; \
      if [ $? -ne 0 ]; then overall_success="false"; fi; \
      ls -lh "$LOCKFILE_NAME" ; \
    fi;

# --- turbo prune ---
FROM base AS prune
RUN corepack enable pnpm
WORKDIR /app
COPY --exclude=node_modules --exclude=.* --exclude=apps . .
COPY --exclude=./apps/pragmatic-papers/.* ./apps/pragmatic-papers ./apps/pragmatic-papers
COPY --from=create-locks /app/pnpm-lock.yaml* .

# set your app name here
ARG APP_NAME=pragmatic-papers
ENV DEBUG="true"
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ARG TURBO_VERSION=2.6.2

RUN set -e ;\
    pnpm dlx turbo@${TURBO_VERSION} prune --scope=${APP_NAME} --docker; \
    if [ -n "${DEBUG}" ] && [ "$DEBUG" = "true" ]; then pwd && ls -alhR ; fi;


# Install dependencies only when needed
FROM base AS deps
RUN corepack enable pnpm
WORKDIR /app
# Set the debug env variable to true to enable debug logs
ENV DEBUG="true"
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ENV NODE_ENV=development
ARG APP_NAME=pragmatic-papers

# Install dependencies based on the preferred package manager
COPY --from=prune /app/out/json/ .

RUN set -e; \
    echo "Installing dependencies using pnpm with lockfile pnpm-lock.yaml..." >&2; \
    pnpm install --filter ./apps/$APP_NAME... --frozen-lockfile ; \
  if [ -n "$DEBUG" ] && [ "$DEBUG" = "true" ]; then pwd && ls -alh && ls -alh apps && ls -alh apps/${APP_NAME} ; fi

# Rebuild the source code only when needed
FROM base AS builder
ARG PAYLOAD_SECRET
ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_DB
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG DATABASE_URI
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV DATABASE_URI=${DATABASE_URI}

RUN corepack enable pnpm
WORKDIR /app
COPY --from=prune /app/out/full/ ./
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=deps /app/apps/pragmatic-papers/node_modules /app/apps/pragmatic-papers/node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Set the debug env variable to true to enable debug logs
ENV DEBUG="true"
ENV NEXT_CLI_BUNDLER=webpack
ENV NEXT_DISABLE_TURBOPACK=1
ENV HUSKY=0
ENV HUSKY_SKIP_INSTALL=1
ENV PACKAGE_MANAGER="pnpm"
ENV NODE_ENV=development
ARG APP_NAME=pragmatic-papers

RUN \
  overall_success="true" ; \
  failed_build_commands=""; \
  if [ -f pnpm-lock.yaml ] ; then  \
    if [ -n "$DEBUG" ] && [ "$DEBUG" = "true" ] ; then  \
      echo "Building with pnpm..." >&2; \
    fi; \
    pnpm --filter ./apps/$APP_NAME build ; \
  if [ $? -ne 0 ] ; then overall_success="false" &&  \
      failed_build_commands="$failed_build_commands, pnpm";  \
    fi; \
  else  \
    echo "No valid lockfile found for package manager $PACKAGE_MANAGER. Cannot build application." >&2; \
    exit 1; \
  fi; \
  if [ -n "$DEBUG" ] && [ "$DEBUG" = "true" ] ; then  \
    echo "Build step completed with overall success status: $overall_success" >&2; \
    echo "CWD after build:" >&2; \
    pwd && ls -alh; \
    if [ -d ./.next ] ; then \
      echo ".next folder:" >&2; \
      ls -alh ./.next >&2; \
    else \
      echo "No .next folder found" >&2; \
    fi; \
  fi; \
  if [ "$overall_success" == "false" ] ; then \
    echo "Build failed running the following command(s): ${failed_build_commands:2}.  \
    Please check the logs for more details."  \
    && exit 1; \
  fi;


# Production image, copy all the files and run next
FROM base AS runner
ARG PAYLOAD_SECRET
ARG POSTGRES_HOST
ARG POSTGRES_PORT
ARG POSTGRES_DB
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG DATABASE_URI
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV DATABASE_URI=${DATABASE_URI}

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs ; \
    mkdir .next && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/pragmatic-papers/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/pragmatic-papers/.next/static ./apps/pragmatic-papers/.next/static
COPY --from=builder /app/apps/pragmatic-papers/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
