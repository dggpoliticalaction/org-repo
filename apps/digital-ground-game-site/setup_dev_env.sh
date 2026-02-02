#!/bin/bash
# Setup script for Odoo Python development environment using UV
# UV is a fast Python package installer and resolver written in Rust

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Odoo Development Environment Setup (UV)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo -e "${YELLOW}UV not found. Installing UV...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    echo -e "${GREEN}✓ UV installed${NC}"
    echo ""
    echo -e "${YELLOW}Please restart your shell or run:${NC}"
    echo -e "  source \$HOME/.cargo/env"
    echo ""
    exit 0
fi

echo -e "${GREEN}✓ UV found: $(uv --version)${NC}"
echo ""

# Check Python version
echo -e "${YELLOW}Checking Python version...${NC}"
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}✓ Python $PYTHON_VERSION found${NC}"
echo ""

# Clean up old virtual environment if requested
if [ -d ".venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists.${NC}"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing existing virtual environment...${NC}"
        rm -rf .venv
        echo -e "${GREEN}✓ Removed existing .venv${NC}"
    fi
fi

# Create virtual environment with uv
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment with UV...${NC}"
    uv venv --python 3.11
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source .venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Install Odoo from local submodule (minimal for IDE support)
if [ -d "odoo" ]; then
    echo -e "${YELLOW}Installing Odoo dependencies (minimal for IDE support)...${NC}"
    echo -e "${BLUE}Note: Skipping system-dependent packages (python-ldap, etc.)${NC}"
    echo -e "${BLUE}      These aren't needed for code completion/linting.${NC}"

    # Install only the core dependencies needed for IDE support
    # Skip packages that require system libraries
    echo -e "${YELLOW}Installing essential Odoo dependencies...${NC}"

    # Create a minimal requirements file for IDE support
    cat > /tmp/odoo-ide-requirements.txt << 'EOF'
# Core dependencies for Odoo IDE support
Babel>=2.17.0
Jinja2>=3.1.2
MarkupSafe>=2.1.5
Pillow>=11.0.0
Werkzeug>=3.0.1
decorator>=5.1.1
docutils>=0.20.1
lxml>=5.2.1
polib>=1.1.1
psutil>=5.9.8
psycopg2-binary>=2.9.10
python-dateutil>=2.8.2
python-stdnum>=1.19
pytz
reportlab>=4.1.0
requests>=2.31.0
zeep>=4.3.1
EOF

    uv pip install -r /tmp/odoo-ide-requirements.txt
    rm /tmp/odoo-ide-requirements.txt
    echo -e "${GREEN}✓ Essential Odoo dependencies installed${NC}"

    # Install Odoo in editable mode (this gives us the Odoo package for imports)
    echo -e "${YELLOW}Installing Odoo in editable mode...${NC}"
    uv pip install -e odoo --no-deps
    echo -e "${GREEN}✓ Odoo installed in editable mode (for IDE imports)${NC}"
    echo ""
    echo -e "${YELLOW}Note: This is a minimal install for IDE support only.${NC}"
    echo -e "${YELLOW}      Run Odoo in Docker for actual development/testing.${NC}"
else
    echo -e "${RED}Error: Odoo submodule not found at ./odoo${NC}"
    echo "Please initialize the Odoo git submodule first:"
    echo "  git submodule update --init --recursive"
    exit 1
fi
echo ""

# Install development dependencies
if [ -f "requirements-dev.txt" ]; then
    echo -e "${YELLOW}Installing development dependencies with UV...${NC}"
    uv pip install -r requirements-dev.txt
    echo -e "${GREEN}✓ Development dependencies installed${NC}"
else
    echo -e "${YELLOW}requirements-dev.txt not found, installing essential dev tools...${NC}"
    uv pip install ruff mypy black isort pylint-odoo pre-commit ipython ipdb pytest
    echo -e "${GREEN}✓ Essential dev tools installed${NC}"
fi
echo ""

# Create .env file for environment variables
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Python environment configuration
PYTHONPATH=${PWD}/odoo:${PWD}/addons
PYTHONUNBUFFERED=1

# Odoo configuration (for local development)
ODOO_RC=./config/odoo.conf

# Database configuration
PGHOST=localhost
PGPORT=5432
PGDATABASE=odoo
PGUSER=odoo
PGPASSWORD=odoo
EOF
    echo -e "${GREEN}✓ .env file created${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

# Set up pre-commit hooks
echo -e "${BLUE}Pre-commit hooks setup:${NC}"
read -p "Do you want to set up pre-commit hooks for automatic linting? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    if command -v pre-commit &> /dev/null || uv pip list | grep -q pre-commit; then
        echo -e "${YELLOW}Setting up pre-commit hooks...${NC}"

        # Create .pre-commit-config.yaml if it doesn't exist
        if [ ! -f ".pre-commit-config.yaml" ]; then
            cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.9
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: check-merge-conflict

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.7.1
    hooks:
      - id: mypy
        args: [--ignore-missing-imports, --no-strict-optional]
        additional_dependencies: [types-psycopg2, types-requests]
EOF
            echo -e "${GREEN}✓ Created .pre-commit-config.yaml${NC}"
        fi

        pre-commit install
        echo -e "${GREEN}✓ Pre-commit hooks installed${NC}"
    else
        echo -e "${YELLOW}pre-commit not found, skipping...${NC}"
    fi
fi
echo ""

# Create uv.lock file for reproducible installs
echo -e "${YELLOW}Creating UV lock file for reproducible installs...${NC}"
uv pip freeze > uv-requirements.txt
echo -e "${GREEN}✓ Dependencies locked in uv-requirements.txt${NC}"
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete! 🎉⚡${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Your Python development environment is ready!${NC}"
echo ""
echo -e "${YELLOW}Why UV is awesome:${NC}"
echo "  • 10-100x faster than pip"
echo "  • Better dependency resolution"
echo "  • Handles conflicting package versions"
echo "  • Built-in virtual environment management"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo ""
echo "  ${BLUE}1. Activate the virtual environment:${NC}"
echo -e "     ${GREEN}source .venv/bin/activate${NC}"
echo ""
echo "  ${BLUE}2. Verify installation:${NC}"
echo "     python -c 'import odoo; print(odoo.release.version)'"
echo "     ruff --version"
echo "     mypy --version"
echo ""
echo "  ${BLUE}3. Start coding!${NC}"
echo "     cd addons/blog_footnotes/"
echo ""
echo "  ${BLUE}4. Start Odoo in Docker:${NC}"
echo -e "     ${GREEN}docker-compose up -d${NC}"
echo ""
echo -e "${YELLOW}Useful UV commands:${NC}"
echo "  • Install package:     uv pip install <package>"
echo "  • Uninstall:           uv pip uninstall <package>"
echo "  • List packages:       uv pip list"
echo "  • Update all:          uv pip install --upgrade -r requirements-dev.txt"
echo "  • Freeze deps:         uv pip freeze > uv-requirements.txt"
echo ""
echo -e "${YELLOW}Code quality commands:${NC}"
echo "  • Format code:         ruff format ."
echo "  • Check linting:       ruff check ."
echo "  • Fix issues:          ruff check --fix ."
echo "  • Type checking:       mypy addons/"
echo "  • Run pre-commit:      pre-commit run --all-files"
echo ""
echo -e "${YELLOW}Editor setup:${NC}"
echo "  • Zed:    Settings in .zed/settings.json (already configured!)"
echo "  • VSCode: Settings in .vscode/settings.json (already configured!)"
echo "  • Make sure your editor uses: ${GREEN}.venv/bin/python${NC}"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
echo ""
