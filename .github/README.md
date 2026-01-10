# Deployment System Documentation

Complete guide for GitHub Actions → Docker → Coolify deployment pipeline.

## 📋 Quick Overview

This monorepo uses automated deployments for 3 applications:

- **Pragmatic Papers** - Next.js + Payload CMS
- **DGGP Website** - Next.js + Payload CMS
- **Discord Bot** - TypeScript bot

**Deployment Flow:**

1. GitHub Actions builds Docker images
2. Images pushed to container registry (GitHub Container Registry)
3. Coolify pulls and deploys images

**Important:** Preview deployments use the same environment variables as staging (shared database, S3 bucket, etc.)

## 🚀 Deployment Environments

### Preview (Pull Requests)

- Triggered by adding labels to PRs
- Labels: `pragmatic-papers`, `dggp-website`, `discord-bot`
- Only builds apps with changes
- Built with development mode + debug symbols
- Tagged as `pr-123`, `preview-abc123`

### Staging (dev branch)

- Triggered automatically on merge to `dev`
- Only builds apps with changes
- Built with development mode + debug symbols
- Tagged as `staging`, `staging-abc123`

### Production (main branch)

- Triggered automatically on push to `main`
- Only builds apps with changes
- Built with production optimizations
- Tagged as `latest`, `production`, `production-abc123`

## 🔧 Required GitHub Secrets

Go to **Settings → Secrets and variables → Actions**

### Core Secrets

```
COOLIFY_API_TOKEN         # Coolify API token
COOLIFY_API_URL           # https://coolify.yourdomain.com
```

### Docker Registry

```
DOCKER_REGISTRY           # ghcr.io (GitHub Container Registry)
DOCKER_USERNAME           # your-github-username
DOCKER_PASSWORD           # GitHub Personal Access Token (PAT)
```

### Application UUIDs (Coolify)

```
# Pragmatic Papers
COOLIFY_PRAGMATIC_PAPERS_UUID                # Preview
COOLIFY_PRAGMATIC_PAPERS_STAGING_UUID        # Staging
COOLIFY_PRAGMATIC_PAPERS_PRODUCTION_UUID     # Production

# DGGP Website
COOLIFY_DGGP_WEBSITE_UUID                    # Preview
COOLIFY_DGGP_WEBSITE_STAGING_UUID            # Staging
COOLIFY_DGGP_WEBSITE_PRODUCTION_UUID         # Production

# Discord Bot
COOLIFY_DISCORD_BOT_UUID                     # Preview
COOLIFY_DISCORD_BOT_STAGING_UUID             # Staging
COOLIFY_DISCORD_BOT_PRODUCTION_UUID          # Production
```

### Docker Image Names

```
DOCKER_IMAGE_PRAGMATIC_PAPERS    # your-org/pragmatic-papers
DOCKER_IMAGE_DGGP_WEBSITE        # your-org/dggp-website
DOCKER_IMAGE_DISCORD_BOT         # your-org/discord-bot
```

### Build-Time Database Secrets

**Important:** Preview and Staging environments share the same database and S3 credentials. This simplifies setup and reduces infrastructure costs.

**Pragmatic Papers** (needs DB during build for migrations + static generation):

```
# Databases
PRAGMATIC_PAPERS_STAGING_DATABASE_URI         # Shared: Preview & Staging
PRAGMATIC_PAPERS_PRODUCTION_DATABASE_URI

# Payload CMS
PRAGMATIC_PAPERS_PAYLOAD_SECRET

# S3 Storage - Staging (Shared: Preview & Staging)
PRAGMATIC_PAPERS_STAGING_S3_BUCKET
PRAGMATIC_PAPERS_STAGING_S3_REGION
PRAGMATIC_PAPERS_STAGING_S3_ACCESS_KEY_ID
PRAGMATIC_PAPERS_STAGING_S3_SECRET_ACCESS_KEY
PRAGMATIC_PAPERS_STAGING_S3_ENDPOINT          # Optional

# S3 Storage - Production
PRAGMATIC_PAPERS_PRODUCTION_S3_BUCKET
PRAGMATIC_PAPERS_PRODUCTION_S3_REGION
PRAGMATIC_PAPERS_PRODUCTION_S3_ACCESS_KEY_ID
PRAGMATIC_PAPERS_PRODUCTION_S3_SECRET_ACCESS_KEY
PRAGMATIC_PAPERS_PRODUCTION_S3_ENDPOINT       # Optional
```

**DGGP Website** (needs DB during build):

```
DGGP_WEBSITE_STAGING_DATABASE_URI             # Shared: Preview & Staging
DGGP_WEBSITE_PRODUCTION_DATABASE_URI
DGGP_WEBSITE_PAYLOAD_SECRET
```

## 🏷️ GitHub Labels

Create these labels in your repository:

| Label              | Description                     |
| ------------------ | ------------------------------- |
| `pragmatic-papers` | Deploy Pragmatic Papers preview |
| `dggp-website`     | Deploy DGGP Website preview     |
| `discord-bot`      | Deploy Discord Bot preview      |

## 🐳 Docker Setup

### GitHub Container Registry (GHCR)

1. **Create Personal Access Token (PAT):**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with scopes: `write:packages`, `read:packages`, `delete:packages`
   - Copy the token

2. **Set Secrets:**
   ```
   DOCKER_REGISTRY: ghcr.io
   DOCKER_USERNAME: your-github-username
   DOCKER_PASSWORD: ghp_xxxxxxxxxxxxx (your PAT)
   ```

### Alternative: Docker Hub

```
DOCKER_REGISTRY: docker.io
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-token
```

## ☁️ Coolify Setup

### 1. Create Applications

Create 9 applications (3 apps × 3 environments):

```
pragmatic-papers-preview
pragmatic-papers-staging
pragmatic-papers-production

dggp-website-preview
dggp-website-staging
dggp-website-production

discord-bot-preview
discord-bot-staging
discord-bot-production
```

### 2. Configure Each Application

**Important:** Set source type to **Docker Image** (not Git)

**Preview Applications:**

- Source Type: Docker Image
- Auto Deploy: ❌ Disabled
- Preview Deployments: ✅ Enabled
- Preview URL Template: `{{pr_id}}.app-name.preview.yourdomain.com`
- DNS: Setup wildcard DNS `*.app-name.preview.yourdomain.com`

**Staging/Production:**

- Source Type: Docker Image
- Auto Deploy: ❌ Disabled
- Preview Deployments: ❌ Disabled
- Domain: `app-name.staging.yourdomain.com` or `app-name.yourdomain.com`

### 3. Get Application UUIDs

Find UUID in the application URL:

```
https://coolify.yourdomain.com/project/1/application/abc123-def456
                                                      ^^^^^^^^^^^^^^^^
                                                      This is the UUID
```

### 4. Generate API Token

1. Coolify → Profile → Keys & Tokens → API Tokens
2. Generate New Token
3. Copy token (format: `3|WaobqX9tJQshKPuQFHsyApxuOOggg4w...`)

## 🏗️ How Builds Work

### Build Process (Pragmatic Papers Example)

```
1. GitHub Actions triggered
2. Checks for changes in apps/pragmatic-papers/
3. If changed:
   - Set up Docker Buildx
   - Login to Docker registry
   - Build multi-stage Dockerfile:
     a. PRUNER stage: turbo prune pragmatic-papers --docker
     b. DEPS stage: Install dependencies
     c. BUILDER stage:
        - Set DATABASE_URI, PAYLOAD_SECRET, S3_* as env vars
        - Run: pnpm run ci (payload migrate && pnpm build)
        - Migrations run against database
        - Next.js statically generates pages
     d. RUNNER stage: Copy runtime files only
   - Push to registry with tags
4. Trigger Coolify deployment with image tag
5. Coolify pulls image and deploys
6. Update PR comment with status
```

### Why Database During Build?

Payload CMS apps need database access to:

- **Run migrations** - `payload migrate` updates schema
- **Static generation** - Pre-render pages with CMS content
- **Optimize performance** - Build-time rendering vs runtime

Build args are **NOT stored in final image** - only used during build.

## 📦 Dockerfile Architecture

Each app uses optimized multi-stage Dockerfile:

```dockerfile
# Stage 1: BASE - Setup Node.js + pnpm
FROM node:22-alpine AS base

# Stage 2: PRUNER - Prune monorepo to just this app
RUN turbo prune app-name --docker

# Stage 3: DEPS - Install dependencies
COPY pruned package.json files
RUN pnpm install --frozen-lockfile

# Stage 4: BUILDER - Build application
COPY source code
ARG DATABASE_URI  # For apps that need it
RUN pnpm turbo build --filter=app-name

# Stage 5: RUNNER - Production runtime
COPY only runtime files
USER non-root
CMD ["node", "server.js"]
```

**Benefits:**

- Small final images (~200-400 MB vs ~2 GB without optimization)
- Fast builds with Docker layer caching
- Security: runs as non-root user
- Only production dependencies in final image

## 🔄 Workflow Files

### `.github/workflows/build-and-deploy.yml`

Reusable workflow that handles building and deploying any app.

**Key Features:**

- Smart change detection
- Docker build with Buildx
- GitHub Actions cache for Docker layers
- Turbo prune for minimal context
- Coolify deployment triggering
- Status monitoring

### `.github/workflows/preview-deployments.yml`

Handles PR preview deployments.

**Triggers:**

- PR opened/synchronized/reopened/labeled
- Checks for deployment labels
- Prompts user to add labels if none present
- Updates PR comment with deployment status

### `.github/workflows/staging-deployments.yml`

Auto-deploys to staging on `dev` branch.

**Triggers:**

- Push to `dev` branch
- Detects changed apps
- Deploys only what changed

### `.github/workflows/production-deployments.yml`

Auto-deploys to production on `main` branch.

**Triggers:**

- Push to `main` branch
- Detects changed apps
- Deploys only what changed

## 🎯 Usage Examples

### Deploy Preview for PR

```bash
# 1. Create PR with changes to pragmatic-papers
# 2. Add label: pragmatic-papers
# 3. Workflow builds and deploys
# 4. Check PR comment for preview URL
```

### Deploy to Staging

```bash
git checkout dev
git merge feature-branch
git push origin dev
# Automatically deploys changed apps
```

### Deploy to Production

```bash
git checkout main
git merge dev
git push origin main
# Automatically deploys changed apps
```

## 🔍 Monitoring & Debugging

### Check Deployment Status

**GitHub Actions:**

- Repository → Actions tab
- View workflow run
- Check deployment summary

**PR Comments:**

- Status: ✅ Success, ❌ Failed, ⏳ Pending
- Preview URL links
- Build log links

**Coolify:**

- Application → Deployments tab
- View real-time logs
- Check container status

### Debug Failed Build

```bash
# 1. Check workflow logs in GitHub Actions
# 2. Look for build errors in Docker build step
# 3. Check Coolify deployment logs
# 4. Verify secrets are set correctly
# 5. Test build locally:

docker build \
  -f apps/pragmatic-papers/Dockerfile \
  --build-arg DATABASE_URI="postgresql://..." \
  --build-arg PAYLOAD_SECRET="..." \
  .
```

## 🔐 Security Best Practices

1. **Separate databases per environment**
   - Preview: `preview-db.yourdomain.com`
   - Staging: `staging-db.yourdomain.com`
   - Production: `production-db.yourdomain.com`

2. **Use separate S3 buckets per environment**
   - `pragmatic-papers-preview`
   - `pragmatic-papers-staging`
   - `pragmatic-papers-production`

3. **Rotate secrets regularly**
   - API tokens every 90 days
   - Database passwords quarterly
   - Update GitHub secrets immediately

4. **Build-time credentials should be read-only when possible**
   - Exception: migration user needs write access for schema changes

5. **Never commit secrets**
   - Use GitHub Secrets
   - Don't hardcode in Dockerfiles
   - Don't log secrets in workflows

## ⚠️ Common Issues

### Issue: Build fails with database connection error

**Solution:**

- Verify DATABASE_URI secret is set correctly
- Check database allows connections from GitHub Actions IPs
- Ensure database exists
- **Note:** Preview deployments share staging database (same credentials)

### Issue: "turbo: command not found"

**Solution:**

- Turbo is installed in pruner stage
- Check Dockerfile syntax
- Ensure pnpm is working correctly

### Issue: PR comment not updating

**Solution:**

- Check workflow has `pull-requests: write` permission
- Settings → Actions → General → Workflow permissions → Read and write

### Issue: Image not found in Coolify

**Solution:**

- Verify image was pushed to registry successfully
- Check Coolify has registry credentials (if private)
- Verify image tag matches what workflow sent

### Issue: Changes not detected

**Solution:**

- Verify files changed in correct directory (e.g., `apps/pragmatic-papers/`)
- Check workflow logs for git diff output
- May need to manually re-run workflow

## 📊 Performance Tips

### Faster Builds

- ✅ Use Docker layer caching (automatic in workflows)
- ✅ Use Turbo prune (reduces build context)
- ✅ Cache pnpm store with `--mount=type=cache`
- ✅ Don't use `--no-cache` unless debugging

### Smaller Images

- ✅ Multi-stage builds (already implemented)
- ✅ Alpine Linux base (already using)
- ✅ Only copy runtime files to final stage
- ✅ Use Next.js standalone output

### Build Time Comparison

```
Without optimization:    ~15 minutes
With Turbo + caching:   ~3-5 minutes
Subsequent builds:      ~1-2 minutes (cache hits)
```

## 🎓 Additional Notes

### Build-Time vs Runtime Variables

**Build-time** (passed as Docker build args):

- DATABASE_URI - for migrations and static generation
- PAYLOAD_SECRET - for Payload CMS operations
- S3\_\* - for uploading assets during build

**Runtime** (set in Coolify environment variables):

- Same variables needed for the running application
- Also include API keys, feature flags, etc.

**Preview/Staging Shared Resources:**

- Preview deployments use staging database and S3 bucket
- This reduces infrastructure costs and simplifies management
- Different Coolify apps still allow separate deployment testing

### Turbo Prune

`turbo prune app-name --docker` creates minimal build context:

```
out/
├── json/           # Only package.json files needed
├── full/           # Only source code needed
└── pnpm-lock.yaml  # Pruned lockfile
```

This makes builds faster and more efficient.

### Image Tagging Strategy

- **Preview:** `pr-123` (easy to identify which PR)
- **Staging:** `staging` + `staging-abc123` (mutable + immutable tags)
- **Production:** `latest` + `production` + `production-abc123`

Multiple tags allow both mutable references (latest, staging) and immutable references (SHA-based) for rollbacks.

## 📞 Getting Help

1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Check Coolify deployment logs
4. Verify all secrets are set
5. Test Docker build locally
6. Ask in team chat with workflow run link + error message

---

**Last Updated:** January 2025
