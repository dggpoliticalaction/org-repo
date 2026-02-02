# Odoo Development Setup with Docker Compose

This docker-compose configuration sets up a complete development environment for Odoo built from your **local git submodule** with custom module support.

## 🔑 Default Login Credentials

After the database is initialized, you can log in with:

- **URL:** http://localhost:8069
- **Username:** `admin`
- **Password:** `admin`

⚠️ **Important:** Change the admin password after first login for security!

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Odoo git submodule cloned in the `./odoo` directory
- Your custom modules in the `./addons` directory

### Starting the Development Environment

1. **Build the Docker image (first time only):**
   ```bash
   pnpm run build
   # or
   docker-compose build
   ```
   This may take 5-10 minutes on first build as it:
   - Installs Python 3.10 and all system dependencies
   - Installs all Python requirements from `./odoo/requirements.txt`
   - Installs Odoo in editable mode for live code modification

2. **Start the services:**
   ```bash
   pnpm run dev:detached
   # or
   docker-compose up -d
   ```

3. **Access Odoo:**
   - Open your browser and navigate to `http://localhost:8069`
   - Log in with username `admin` and password `admin`
   - The database will be automatically initialized with base modules on first startup

4. **View logs:**
   ```bash
   pnpm run logs:odoo
   # or
   docker-compose logs -f odoo
   ```

### Stopping the Environment

```bash
pnpm run stop
# or
docker-compose down
```

To remove volumes as well (WARNING: this deletes your database):
```bash
pnpm run stop:volumes
# or
docker-compose down -v
```

## Environment Configuration

Edit the `.env` file to customize:
- `POSTGRES_DB` - Database name (default: odoo)
- `POSTGRES_USER` - Database user (default: odoo)
- `POSTGRES_PASSWORD` - Database password (default: odoo)
- `ODOO_HOST` - Database host (default: db)

Example `.env`:
```env
POSTGRES_DB=odoo
POSTGRES_USER=odoo
POSTGRES_PASSWORD=your-secure-password
ODOO_HOST=db
```

## Directory Structure

```
digital-ground-game-site/
├── docker-compose.yml          # Docker Compose configuration
├── Dockerfile                  # Custom Dockerfile building from local Odoo
├── .env                        # Environment variables (optional)
├── config/
│   └── odoo.conf              # Odoo configuration file
├── addons/                     # Your custom Odoo modules
│   └── blog_footnotes/         # Example custom module
└── odoo/                       # Odoo source code (git submodule)
    ├── odoo-bin                # Odoo executable
    ├── requirements.txt        # Python dependencies
    ├── addons/                 # Core Odoo modules
    └── ...
```

## How It Works

### Custom Dockerfile

The `Dockerfile` in this directory:
1. Starts from `python:3.10-slim-bookworm` base image
2. Installs all required system dependencies (PostgreSQL client, node-less, fonts, etc.)
3. Creates an `odoo` user for security
4. Copies the local `./odoo` git submodule into the container
5. Installs all Python dependencies from `requirements.txt`
6. Installs Odoo in **editable mode** (`pip install -e .`) for live development

### Why Editable Mode?

Installing Odoo with `pip install -e .` allows you to:
- Modify Odoo source code and have changes reflected immediately
- Use Python debugger directly in the Odoo codebase
- Test custom modules against your specific Odoo version

### PostgreSQL Integration

- PostgreSQL runs in a separate `postgres:15-alpine` container
- Connected via the `odoo_network` bridge network
- Database credentials are passed through environment variables
- Health checks ensure database is ready before Odoo starts

## Custom Modules Development

### Adding Custom Modules

1. Place your custom modules in the `./addons` directory
2. The modules are automatically mounted to `/mnt/extra-addons` in the container
3. Update module list to discover new modules:
   ```bash
   # Go to Apps → Update Apps List in the web interface
   # Or via command line (if running):
   docker-compose exec odoo odoo -u all -d odoo
   ```

### Installing Modules

1. Log in to Odoo as admin
2. Go to **Apps** → **Update Apps List**
3. Search for your module and click **Install**

### Module Development Workflow

With the local Odoo source mounted:
- Python code changes are reflected on browser refresh
- Template/XML changes are automatically detected
- Static files (CSS, JS) require module update or browser refresh
- Use `pnpm run logs:odoo` to see real-time debug output

### Creating a New Module

```bash
docker-compose exec odoo odoo scaffold my_module /mnt/extra-addons
```

This generates a basic module scaffold in `./addons/my_module/`.

## Services

### PostgreSQL Database (db)
- **Image:** postgres:15-alpine
- **Container:** odoo-db
- **Port:** 5432
- **Volume:** `postgres_data` - Persists database between restarts
- **Health Check:** Waits for readiness before starting Odoo

### Odoo Server (odoo)
- **Built from:** Local `./odoo` git submodule via custom Dockerfile
- **Container:** odoo-dev
- **Port:** 8069 - Main web interface
- **Port:** 8071 - XMLRPC protocol (for external integrations)
- **Port:** 8072 - Long polling (for real-time updates)
- **Volumes:**
  - `./addons` → `/mnt/extra-addons` - Your custom modules
  - `./config/odoo.conf` → `/etc/odoo/odoo.conf` - Configuration (read-only)
  - `odoo_filestore` → `/var/lib/odoo` - File attachments and data

## Configuration

### odoo.conf

The `./config/odoo.conf` file controls Odoo behavior. Key settings:

```ini
[options]
addons_path = /mnt/extra-addons
data_dir = /var/lib/odoo
workers = 0              # Single worker for debugging
logfile = /var/log/odoo/odoo.log
```

The file is mounted read-only in the container. To change settings:
1. Edit `./config/odoo.conf`
2. Restart the container: `pnpm run restart:odoo`

### Database Configuration

Database connection parameters are set via environment variables:
- `HOST` / `ODOO_HOST` - Database hostname (default: db)
- `PORT` - Database port (default: 5432)
- `USER` / `POSTGRES_USER` - Database user (default: odoo)
- `PASSWORD` / `POSTGRES_PASSWORD` - Database password (default: odoo)

Override in `.env` file or with `-e` flag:
```bash
docker-compose -e POSTGRES_PASSWORD=secure-pwd up -d
```

## Managing the Database

### Create a New Database

From the Odoo web interface:
1. Click your profile → **Manage Databases**
2. **Create Database** and complete the setup wizard

### Backup the Database

```bash
pnpm run db:backup
# Creates: backup_YYYYMMDD_HHMMSS.sql
```

Or manually:
```bash
docker-compose exec -T db pg_dump -U odoo -d odoo > backup.sql
```

### Restore from Backup

```bash
pnpm run db:restore
# Restores from: backup.sql
```

Or manually:
```bash
docker-compose exec -T db psql -U odoo -d odoo < backup.sql
```

### Database Shell

```bash
pnpm run shell:db
# or
docker-compose exec db psql -U odoo -d odoo
```

## Container Access

### Odoo Container Shell

```bash
pnpm run shell
# or
docker-compose exec odoo bash
```

From here you can:
- Edit files directly
- Run Odoo commands
- Install additional Python packages (temporary)
- Debug issues

### View Live Logs

```bash
pnpm run logs:odoo
# or
docker-compose logs -f odoo

# View specific container logs:
docker-compose logs -f db        # Database logs
docker-compose logs -f           # All logs
```

## Rebuilding the Image

After updating the `./odoo` git submodule or changing dependencies:

```bash
pnpm run build
# or
docker-compose build

# Force rebuild without cache:
docker-compose build --no-cache
```

This will:
1. Re-copy the Odoo source from git submodule
2. Re-install Python dependencies
3. Rebuild the entire image

## Troubleshooting

### Build fails with "ModuleNotFoundError" or import errors
- Ensure Python 3.10 dependencies are installed
- Check that `./odoo/requirements.txt` exists and is readable
- Try rebuilding without cache: `docker-compose build --no-cache`
- Check Docker daemon has enough resources (memory, disk space)

### Odoo won't connect to database
```bash
# Check if database is running and healthy
pnpm run status

# View database logs
pnpm run logs:db

# Verify database is accessible
docker-compose exec db pg_isready -U odoo
```

### Cannot log in / "Invalid credentials"
- Default username is `admin` (not your email)
- Default password is `admin`
- If you changed the password and forgot it, reset it via SQL:
  ```bash
  docker-compose exec db psql -U odoo -d odoo -c "UPDATE res_users SET password='admin' WHERE login='admin';"
  ```

### Modules not appearing
1. Ensure modules are in `./addons` directory
2. Go to **Apps** → **Update Apps List** in web interface
3. Restart Odoo: `pnpm run restart:odoo`
4. Check logs for errors: `pnpm run logs:odoo`

### Port already in use
Modify the ports in `docker-compose.yml`:
```yaml
ports:
  - "8080:8069"   # Map to different local port
  - "8070:8071"
  - "8073:8072"
```

### File permissions issues
The container runs as the `odoo` user. If you get permission errors:
```bash
# Make files readable
chmod -R 755 ./addons ./config ./odoo
```

### Changes to Odoo source not reflected
1. Ensure Odoo is installed in editable mode (it should be by default)
2. For some changes (especially in `__init__.py`), restart the container:
   ```bash
   pnpm run restart:odoo
   ```
3. View logs for import errors: `pnpm run logs:odoo`

### Build takes too long
First build takes 5-10 minutes. Subsequent builds are faster due to Docker layer caching.
- Subsequent `docker-compose up` calls won't rebuild unless you change the Dockerfile or run `docker-compose build`

### Out of disk space
Docker images can be large (around 2-3GB). Free up space or clean old images:
```bash
docker system prune -a
```

## npm/pnpm Commands

### Start & Stop
```bash
pnpm run dev              # Start in foreground (see logs)
pnpm run dev:detached     # Start in background
pnpm run stop             # Stop all services
pnpm run stop:volumes     # Stop and remove volumes (deletes database!)
```

### Logs & Monitoring
```bash
pnpm run status           # Show container status
pnpm run logs             # Show all logs (live)
pnpm run logs:odoo        # Odoo logs only
pnpm run logs:db          # Database logs only
```

### Container Management
```bash
pnpm run restart          # Restart all services
pnpm run restart:odoo     # Restart only Odoo
pnpm run restart:db       # Restart only database
pnpm run shell            # Open bash in Odoo container
pnpm run shell:db         # Open psql in database
```

### Odoo Operations
```bash
pnpm run odoo:update      # Update all modules in running instance
pnpm run odoo:scaffold    # Generate module scaffold
```

### Database Operations
```bash
pnpm run db:backup        # Backup to timestamped SQL file
pnpm run db:restore       # Restore from backup.sql
```

### Maintenance
```bash
pnpm run build            # Build/rebuild Docker image
pnpm run clean            # Remove containers, volumes, and backups
pnpm run help             # List all available commands
```

## Development Tips

### Hot Reload Workflow
1. Modify Python code in `./addons/your_module/`
2. Refresh browser to see changes
3. For model/view changes: Go to **Apps** → **Update Apps List**

### Debugging
- Add print statements: `print("debug info")`
- Add logging: 
  ```python
  import logging
  _logger = logging.getLogger(__name__)
  _logger.info("Message")
  ```
- View in logs: `pnpm run logs:odoo | grep "Message"`
- Use Python debugger: `pdb.set_trace()` (runs in container shell)

### Performance Optimization
- For production-like testing, set `workers = 2` in `odoo.conf`
- Current setup uses single worker (`workers = 0`) for easier debugging

### Git Submodule Updates

To update Odoo to a newer commit:

```bash
cd odoo
git fetch origin
git checkout main              # or specific branch/tag
cd ..
git add odoo
git commit -m "Update Odoo to latest"
docker-compose build --no-cache
docker-compose restart odoo
```

## Ports Reference

- **8069** - HTTP web interface (http://localhost:8069)
- **8071** - XMLRPC protocol
- **8072** - Long polling / WebSocket
- **5432** - PostgreSQL database

## Resources

- [Odoo Developer Documentation](https://www.odoo.com/documentation/master/developer)
- [Odoo Module Development Guide](https://www.odoo.com/documentation/master/developer/howtos/backend)
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Notes

- Editable install (`pip install -e .`) allows modifying Odoo source directly
- All custom modules should be in `./addons` directory
- Configuration changes in `odoo.conf` take effect on container restart
- Database persists between container restarts via `postgres_data` volume
- File attachments and data persist via `odoo_filestore` volume