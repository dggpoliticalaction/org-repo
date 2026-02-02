FROM python:3.11-slim-bookworm

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    ODOO_RC=/etc/odoo/odoo.conf

# Install system dependencies including build tools for gevent
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential \
    ca-certificates \
    curl \
    dirmngr \
    fonts-noto-cjk \
    git \
    gnupg \
    libffi-dev \
    libldap2-dev \
    libpq-dev \
    libsasl2-dev \
    libssl-dev \
    libtiff-dev \
    libxml2-dev \
    libxslt1-dev \
    locales \
    node-less \
    npm \
    postgresql-client \
    python3-dev \
    python3-magic \
    python3-pip \
    xz-utils \
    && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
    && locale-gen \
    && rm -rf /var/lib/apt/lists/*

# Install rtlcss for right-to-left CSS compilation
RUN npm install -g rtlcss

# Create odoo user
RUN useradd -m -d /var/lib/odoo -s /bin/bash odoo

# Set working directory
WORKDIR /opt/odoo

# Copy the Odoo source from git submodule
COPY ./odoo /opt/odoo

# Install Python dependencies with --prefer-binary to use pre-built wheels
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --prefer-binary -r requirements.txt

# Install Odoo in editable mode for development
RUN pip install --no-cache-dir -e .

# Create necessary directories and set permissions
RUN mkdir -p /var/lib/odoo /mnt/extra-addons /var/log/odoo && \
    chown -R odoo:odoo /var/lib/odoo /mnt/extra-addons /var/log/odoo

# Expose ports
EXPOSE 8069 8071 8072

# Set default user
USER odoo

# Default command - no addons-path specified, will be provided by docker-compose or config
CMD ["odoo", "-c", "/etc/odoo/odoo.conf"]
