# To use this Dockerfile, you have to set `output: 'standalone'` in your next.config.js file.
# From https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22.21-alpine AS base
RUN npm i -g pnpm@10.13.1


# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Set the debug env variable to true to enable debug logs
ENV DEBUG="true"
ENV PACKAGE_MANAGER="pnpm"

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN set -e; \
    if [ ! -f package.json ] ; then \
      echo "No package.json found. Cannot check locks or dependencies" >&2; \
      exit 1; \
    fi; \
    LOCKED_ACTIVE="true"; \
    LOCK_FOUND="false"; \
    CREATE_LOCK="false"; \
    LOCKFILE_NAME=""; \
        for LOCKFILE in yarn.lock package-lock.json pnpm-lock.yaml; do \
          if [ -f "$LOCKFILE" ]; then \
            case "$LOCKFILE" in \
              yarn.lock) yarn --frozen-lockfile && LOCK_FOUND="true" ;; \
              package-lock.json) npm ci && LOCK_FOUND="true" ;; \
              pnpm-lock.yaml) corepack enable pnpm && pnpm i --frozen-lockfile && LOCK_FOUND="true" ;; \
            esac; \
          fi; \
          if [ "$LOCK_FOUND" = "true" ]; then \
            break; \
          fi; \
        done; \
        if [ "$LOCK_FOUND" = "false" ]; then \
          if [ -n "$PACKAGE_MANAGER" ]; then \
            echo "Preferred package manager is set to '$PACKAGE_MANAGER' but lockfile(s) not found. Attempting to create lockfile" >&2; \
            CREATE_LOCK="true"; \
          else \
            echo "Missing lock file and no package manager selected with  ENV PACKAGE_MANAGER." >&2 && exit 1 ; \
          fi; \
        else \
          echo "Dependencies installed successfully using existing lockfile." >&2; \
          CREATE_LOCK="false"; \
        fi; \
    if [ "$CREATE_LOCK" = "true" ]; then \
          overall_success="true"; \
          echo "Attempting  to install lock for $PACKAGE_MANAGER." >&2; \
          if [ "$PACKAGE_MANAGER" = "yarn" ]; then \
            echo "Creating \`yarn.lock\` via yarn in temp dir..." && \
            LOCKFILE_NAME="yarn.lock" && \
            mkdir -p /tmp/lockgen && cp package.json /tmp/lockgen/ && \
            (cd /tmp/lockgen && yarn install --ignore-scripts --non-interactive --silent) && \
             mv /tmp/lockgen/yarn.lock ./ || true && \
             rm -rf /tmp/lockgen; \
          elif [ "$PACKAGE_MANAGER" = "npm" ] ; then \
                echo "Creating \`package-lock.json\` via npm..." && \
                LOCKFILE_NAME="package-lock.json" && \
                npm install --package-lock-only --ignore-scripts --no-audit --no-fund ; \
          elif [ "$PACKAGE_MANAGER" = "pnpm" ] ; then \
                echo "Creating \`pnpm-lock.yaml\` via pnpm..." && \
                LOCKFILE_NAME="pnpm-lock.yaml" && \
                #corepack enable pnpm && pnpm install  --prod --ignore-workspace --lockfile-only ; \
                corepack enable pnpm && pnpm install  --prod --ignore-workspace ; \
          else \
            echo "Unsupported package manager: $PACKAGE_MANAGER" >&2 ; \
            exit 1; \
          fi; \
          if [ $? -ne 0 ]; then overall_success="false"; fi; \
          if [ "$overall_success" = "false" ]; then \
            echo "Failed to create lock file with package manager $PACKAGE_MANAGER . Read logs for more details" >&2; \
            exit 1; \
          fi; \
    fi; \
     if [ ! -f "./$LOCKFILE_NAME" ] ; then \
          echo "$LOCKFILE_NAME not found after attempting to create with $PACKAGE_MANAGER:" >&2; \
          ls -alh ./ >&2; \
    fi; \
      if [ -n "$DEBUG" ] && [ "$DEBUG" = "true" ] ; then  \
        pwd && ls -alh; \
        if [ -d ./node_modules ] ; then \
          echo "Node modules:" >&2; \
          ls -alh ./node_modules >&2; \
        else \
          echo "No node_modules folder found" >&2; \
          exit 1; \
        fi; \
      fi;

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the debug env variable to true to enable debug logs
ENV DEBUG="true"
ENV PACKAGE_MANAGER="pnpm"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1
# String var op ${VAR_NAME:2} is used to remove leading comma and space.

RUN \
  LOCK_FOUND="false"; \
  CREATE_LOCK="false"; \
  LOCKFILE_NAME=""; \
  overall_success="true" ; \
  failed_info=""; \
  failed_build_commands=""; \
  if [ -f yarn.lock ] && [ "$PACKAGE_MANAGER" = "yarn" ] ;  then \
    yarn run build; \
    if [ $? -ne 0 ] ; then overall_success="false"  &&  \
    failed_build_commands="$failed_build_commands, yarn"; fi; \
  fi; \
  if [ -f package-lock.json ] && [ "$PACKAGE_MANAGER" = "npm" ] ;  then \
    npm run build; \
    if [ $? -ne 0 ] ; then overall_success="false"  && \
    failed_build_commands="$failed_build_commands, npm"; fi; \
  fi; \
  if [ -f pnpm-lock.yaml ] && [ "$PACKAGE_MANAGER" = "pnpm" ] ; then  \
    corepack enable pnpm && pnpm run build; \
    if [ $? -ne 0 ] ; then overall_success="false" &&  \
    failed_build_commands="$failed_build_commands, pnpm"; fi; \
  fi; \
  if [ "$overall_success" == "false" ] ; then \
    echo "Build failed running the following command(s): ${failed_build_commands:2}.  \
    Please check the logs for more details."  \
    && exit 1; \
  fi;


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs ; \
    mkdir .next && chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Remove this line if you do not have this folder
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["HOSTNAME=\"0.0.0.0\"", "node", "server.js"]
