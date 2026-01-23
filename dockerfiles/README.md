# Dockerfiles & Deployment

Docker configurations for deploying applications to staging, preview, and production environments.

> **For local development**, see the docker-compose files in individual application directories.
>
> **All applications now use embedded SQLite databases by default** - no separate database containers needed for staging/preview deployments!

## 📦 Files

**Dockerfiles:**

- `PragmaticPapers.Dockerfile` - Pragmatic Papers (Next.js + Payload CMS)
- `DigitalGroundGame.Dockerfile` - DGG Political Action (Next.js + Payload CMS)
- `DiscordBot.Dockerfile` - Discord Bot

**Environment Template:**

- `.env.example` - Environment variables for all applications

## 🚀 Quick Deploy to Coolify

### 1. Generate Secrets

```bash
openssl rand -base64 32  # For PAYLOAD_SECRET
```

### 2. Create Service in Coolify

- **Type:** Dockerfile
- **Dockerfile:**
  - Pragmatic Papers: `dockerfiles/PragmaticPapers.Dockerfile`
  - DGG Political Action: `dockerfiles/DigitalGroundGame.Dockerfile`
- **Base directory:** `/`

### 3. Set Environment Variables

See `.env.example` for all available options. Minimal configuration:

**For Staging/Preview (SQLite - Default):**

```env
PAYLOAD_SECRET=<generated_secret>
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
```

That's it! SQLite is the default, so no database configuration needed.

**For Production (PostgreSQL):**

```env
PAYLOAD_SECRET=<generated_secret>
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
DATABASE_ADAPTER=postgres
DATABASE_URI=postgresql://postgres:<password>@postgres:5432/<dbname>

# For Pragmatic Papers only:
USE_LOCAL_STORAGE=false
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

- ✓ Build with embedded SQLite database (or connect to PostgreSQL if configured)
- ✓ Run migrations automatically during build
- ✓ Start serving on port 3000

## ⚙️ Architecture

### Staging/Preview (Default - SQLite)

```
┌─────────────────────┐
│  Application        │
│     :3000           │
│  (SQLite embedded)  │
└─────────────────────┘
```

Single container with embedded database - simple and efficient!

### Production (Optional - PostgreSQL)

```
┌─────────────────┐
│  Application    │
│     :3000       │
└────────┬────────┘
         │
┌────────▼────────┐
│   PostgreSQL    │
│  (External DB)  │
└─────────────────┘
```

Use managed PostgreSQL service for scalability.

## 🔍 Common Issues

**Build failures:**

- Ensure all required environment variables are set in Coolify
- For SQLite (default): Only `PAYLOAD_SECRET` and `NEXT_PUBLIC_SERVER_URL` needed
- For PostgreSQL: Also set `DATABASE_ADAPTER=postgres` and `DATABASE_URI`

**Database connection errors (PostgreSQL):**

- Verify `DATABASE_URI` connection string is correct
- Ensure PostgreSQL service is accessible from your deployment

## 🔒 Production Notes

### For SQLite Deployments (Staging/Preview):
1. Generate strong secret: `openssl rand -base64 32`
2. Configure persistent storage in Coolify for `/app/apps/{app-name}/data/`
3. Set up regular database backups

### For PostgreSQL Deployments (Production):
1. Use managed PostgreSQL (AWS RDS, Supabase, Neon, etc.)
2. Generate strong secrets: `openssl rand -base64 32`
3. Configure CDN for static assets (Pragmatic Papers with S3)
4. Set up automated backups
5. Enable monitoring and alerting

## 📝 Data Persistence

### SQLite Storage:
- Database stored in `/app/apps/{app-name}/data/`
- Configure persistent storage in Coolify to preserve data across deployments
- Simple backup: Copy the `.db` file

### PostgreSQL Storage:
- Use managed PostgreSQL service
- Configure automated backups through your provider
- Data persistence handled by database service

### Media Storage (Pragmatic Papers):
- **Staging/Preview**: Local storage in `/app/apps/pragmatic-papers/public/media/`
- **Production**: S3-compatible storage (recommended)

## 🗄️ Database Configuration

Both Pragmatic Papers and DGG Political Action support two database adapters via the `DATABASE_ADAPTER` environment variable:

### SQLite Adapter (Default - Recommended for Staging/Preview)

```env
DATABASE_ADAPTER=sqlite
DATABASE_URI=file:/app/apps/pragmatic-papers/data/payload.db
```

**Perfect for:**
- ✅ Staging and preview environments
- ✅ Development deployments
- ✅ Single-container deployments
- ✅ Simplified infrastructure

**Benefits:**
- No separate database container needed
- Embedded database stored in Docker volume
- Automatic migrations during build (using `ci` script)
- Simpler deployment configuration
- Lower resource usage

**How it works:**
1. SQLite database file stored in `/app/apps/pragmatic-papers/data/`
2. Data persisted via `sqlite_data` Docker volume
3. Migrations run automatically during build
4. No external database connection required

### PostgreSQL Adapter (Recommended for Production)

```env
DATABASE_ADAPTER=postgres
DATABASE_URI=postgresql://postgres:password@postgres:5432/pragmatic_papers
```

**Perfect for:**
- ✅ Production deployments
- ✅ High-traffic applications
- ✅ Multi-instance deployments
- ✅ Advanced scaling needs

**Benefits:**
- Robust and scalable
- Better for high concurrency
- Advanced querying capabilities
- Separate database container for isolation

**How it works:**
1. Requires external PostgreSQL database service
2. Database connection via `DATABASE_URI`
3. Migrations run automatically during build
4. Data persisted by PostgreSQL service

**Setup:**
Use a managed PostgreSQL service (recommended):
- AWS RDS
- Supabase
- Neon
- DigitalOcean Managed Databases
- Or run your own PostgreSQL instance

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
