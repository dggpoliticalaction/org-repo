# Dockerfiles & Deployment

Docker configurations for deploying applications to staging, preview, and production environments with Coolify.

> **For local development**, see the dockerfiles in individual application directories.

## 📦 Files

**Dockerfiles:**

- `PragmaticPapers.Dockerfile` - Pragmatic Papers (Next.js + Payload CMS)
- `DigitalGroundGame.Dockerfile` - DGG Political Action (Next.js + Payload CMS)  
- `DiscordBot.Dockerfile` - Discord Bot

**Compose Files:**

- `docker-compose.pragmatic-papers.yml` - Pragmatic Papers + PostgreSQL
- `docker-compose.dgg-political-action.yml` - DGG Political Action + PostgreSQL

**Environment Templates:**

- `env.pragmatic-papers.example` - Pragmatic Papers variables
- `env.dgg-political-action.example` - DGG Political Action variables

**Scripts:**

- `seed-pragmatic-papers.sh` - Seed Pragmatic Papers database
- `seed-dgg.sh` - Seed DGG database

## 🚀 Quick Deploy to Coolify

### 1. Generate Secrets

```bash
openssl rand -base64 32  # For PAYLOAD_SECRET
openssl rand -base64 32  # For POSTGRES_PASSWORD
```

### 2. Create Service in Coolify

- **Type:** Docker Compose
- **Compose file:**
  - Pragmatic Papers: `dockerfiles/docker-compose.pragmatic-papers.yml`
  - DGG Political Action: `dockerfiles/docker-compose.dgg-political-action.yml`
- **Base directory:** `/`

### 3. Set Environment Variables

Copy from the appropriate `.example` file and set in Coolify:

**Required variables:**

```env
# PostgreSQL
POSTGRES_PASSWORD=<generated_password>

# Application
DATABASE_URI=postgresql://postgres:<password>@postgres:5432/<dbname>
PAYLOAD_SECRET=<generated_secret>
NEXT_PUBLIC_SERVER_URL=https://your-domain.com

# For Pragmatic Papers, also add:
# Build Configuration
USE_EXPERIMENTAL_BUILD=false  # Default: 'false' for traditional SSG build (DB required)
                              # Set to 'true' only if DB not available during build

# Migrations Configuration
RUN_MIGRATIONS_ON_STARTUP=false  # Default: 'false' for CI-based migrations
                                 # Set to 'true' if DB not available during build

# Storage Configuration
USE_LOCAL_STORAGE=true  # Set to 'true' for staging/preview, 'false' for production

# S3 Storage (only required when USE_LOCAL_STORAGE=false)
S3_REGION=us-east-1
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_ENDPOINT=https://s3.amazonaws.com
```

### 4. Configure Domain

- **Application:** Port `3000` → `your-domain.com`

### 5. Deploy

Click **Deploy** in Coolify. The application will:

- ✓ Build with database connection (for static page generation)
- ✓ Run migrations automatically
- ✓ Start serving on port 3000

## 🌱 Seed Database (Optional)

**Via Admin UI (easiest):**

1. Go to `/admin` and create your first user
2. Click "Seed Database" button

**Via container shell:**

```bash
bash /app/dockerfiles/seed-pragmatic-papers.sh
# or
bash /app/dockerfiles/seed-dgg.sh
```

**Note:** Seeding is disabled in production and requires admin authentication.

## ⚙️ Architecture

Each deployment is self-contained:

```
┌─────────────────┐
│  Application    │
│     :3000       │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│     :5432       │
└─────────────────┘
```

Both apps use conventional port 3000 since they deploy separately.

## 🔍 Common Issues

**Build warnings about secrets in ARG:**

- These warnings are expected and safe
- Secrets are needed during build for Next.js to generate static pages
- They are NOT baked into the final image

**Database connection errors:**

- Use `postgres:5432` as host (not `localhost`)
- Verify `DATABASE_URI` matches `POSTGRES_PASSWORD`

**Build failures:**

- Ensure building from repository root (context: `..`)
- Check all environment variables are set

## 🔒 Production Notes

1. Use managed PostgreSQL (AWS RDS, Supabase, etc.)
2. Generate strong secrets: `openssl rand -base64 32`
3. Set `BUILD_ENV=production`
4. Configure CDN for static assets
5. Set up automated backups
6. Enable monitoring and alerting

## 📝 Volumes

- `postgres_data` - Persistent PostgreSQL storage (back up regularly)
- `media_data` - Local media storage for Pragmatic Papers (when `USE_LOCAL_STORAGE=true`)

## 🏗️ Build Mode Configuration (Pragmatic Papers)

Pragmatic Papers supports two build modes via the `USE_EXPERIMENTAL_BUILD` environment variable:

### Traditional Build Mode (Default - Full Static Generation)

```env
USE_EXPERIMENTAL_BUILD=false
```

**Recommended for:** Production deployments where database IS available during build (e.g., CI/CD with DB access)

**How it works:**
1. Connects to database during build
2. Generates static pages at build time (SSG)
3. Optimal performance with pre-rendered pages

**Benefits:**
- ✅ Faster initial page loads (pages pre-generated)
- ✅ Maximum performance optimization
- ✅ Traditional Next.js SSG behavior

### Experimental Build Mode (No DB Required)

```env
USE_EXPERIMENTAL_BUILD=true
```

**Recommended for:** Docker/Coolify deployments where database isn't available during build

**How it works:**
1. **Compile Phase:** Compiles code without static page generation
2. **Env Generation:** Inlines `NEXT_PUBLIC_*` variables for client-side
3. **Runtime Rendering:** Pages rendered dynamically on first request and cached

**Benefits:**
- ✅ No database connection needed during Docker build
- ✅ Build succeeds even if PostgreSQL isn't running
- ✅ Pages still optimized and cached at runtime
- ✅ Simpler build process for containerized deployments

### Which Should You Use?

| Deployment Type | Recommended Setting | Reason |
|----------------|---------------------|--------|
| Production with DB access | `USE_EXPERIMENTAL_BUILD=false` (default) | Pre-generate for best performance |
| Docker/Coolify (DB separate container) | `USE_EXPERIMENTAL_BUILD=true` | DB not available during build |
| Local Docker Compose | `USE_EXPERIMENTAL_BUILD=true` | Simpler setup |

For more details, see [PayloadCMS Documentation on Building Without DB Connection](https://payloadcms.com/docs/production/building-without-a-db-connection).

## 🔄 Database Migrations (Pragmatic Papers)

Pragmatic Papers uses PayloadCMS which requires database migrations when the schema changes.

### Build-time Migrations (Default)

```env
RUN_MIGRATIONS_ON_STARTUP=false
```

When disabled (default), migrations should be run via CI/CD before the build process. This is the recommended approach for production deployments with database access during build because:
- Migrations complete before deployment
- Faster container startup
- Traditional CI/CD workflow
- No slowdown on serverless cold starts

**How it works:**
1. CI/CD runs `pnpm payload migrate` before building
2. Database schema is updated
3. Application builds with up-to-date schema
4. Container starts immediately without migration overhead

**Example CI script:**
```bash
pnpm payload migrate && pnpm build
```

### Runtime Migrations (Alternative)

```env
RUN_MIGRATIONS_ON_STARTUP=true
```

Set to `true` to run migrations automatically when the container starts. Useful for Docker/Coolify deployments where database isn't available during build:
- Database isn't available during Docker build phase
- Migrations execute after PostgreSQL container is ready
- No manual intervention required

**Note:** First startup may take slightly longer while migrations run. Not recommended for serverless deployments due to cold start impact.

## 💾 Storage Configuration (Pragmatic Papers)

Pragmatic Papers supports two storage modes for uploaded files:

### Local Storage (Recommended for Staging/Preview)

```env
USE_LOCAL_STORAGE=true
```

- Files stored in Docker volume `media_data`
- No S3 credentials needed
- Persists across container restarts
- Simpler setup for non-production environments

### S3 Storage (Recommended for Production)

```env
USE_LOCAL_STORAGE=false  # or leave unset
S3_REGION=us-east-1
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_ENDPOINT=https://s3.amazonaws.com
```

- Files stored in S3-compatible storage (AWS S3, Supabase Storage, etc.)
- Better scalability and CDN integration
- Recommended for production deployments

## 🆘 Need Help?

- Check environment variable examples: `.env.*.example`
- Review Coolify logs for build/runtime errors
- Verify health checks in Coolify dashboard
