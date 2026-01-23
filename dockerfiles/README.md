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

## 🆘 Need Help?

- Check environment variable examples: `.env.*.example`
- Review Coolify logs for build/runtime errors
- Verify health checks in Coolify dashboard
