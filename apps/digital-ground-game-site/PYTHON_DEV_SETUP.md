# Python Development Setup for Odoo Module Development

This guide will help you set up a complete Python development environment for creating custom Odoo modules with proper linting, formatting, and type checking support.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Development Tools Overview](#development-tools-overview)
- [Editor Setup](#editor-setup)
  - [Zed Editor](#zed-editor)
  - [VSCode](#vscode)
- [Python Environment](#python-environment)
- [Code Quality Tools](#code-quality-tools)
- [Type Checking](#type-checking)
- [Module Structure](#module-structure)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Install Development Dependencies

You can install the development tools either locally or inside the Docker container.

**Option A: Install in Docker Container (Recommended)**

```bash
# Enter the Odoo container
docker-compose exec odoo bash

# Inside container: Install dev dependencies
pip install -r requirements-dev.txt
```

**Option B: Install Locally (for IDE support)**

```bash
# Create a virtual environment
python3.11 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install Odoo and dev dependencies
pip install -e ./odoo
pip install -r requirements-dev.txt
```

### 2. Configure Your Editor

**For Zed:**
- Settings are already configured in `.zed/settings.json`
- Install Zed from https://zed.dev

**For VSCode:**
- Settings are in `.vscode/settings.json`
- Install recommended extensions when prompted

### 3. Start Coding!

```bash
# Start Odoo development environment
docker-compose up -d

# View logs
docker-compose logs -f odoo
```

## 🛠 Development Tools Overview

This project uses modern Python development tools optimized for Odoo development:

| Tool | Purpose | Configuration File |
|------|---------|-------------------|
| **Ruff** | Ultra-fast linting & formatting | `pyproject.toml` |
| **MyPy** | Static type checking | `pyproject.toml` |
| **Black** | Code formatting (backup) | `pyproject.toml` |
| **isort** | Import sorting | `pyproject.toml` |
| **pylint-odoo** | Odoo-specific linting | `pyproject.toml` |
| **EditorConfig** | Editor consistency | `.editorconfig` |

### Why Ruff?

Ruff replaces multiple tools (flake8, pylint, isort, etc.) with a single, blazing-fast Rust-based tool:
- **10-100x faster** than traditional linters
- **Drop-in replacement** for flake8, pylint, and more
- **Built-in autofix** capabilities
- **Perfect for Odoo** with configurable rules

## 📝 Editor Setup

### Zed Editor

Zed is a high-performance, multiplayer code editor with excellent Python support.

**Installation:**
```bash
# macOS
brew install --cask zed

# Linux (via direct download)
curl -f https://zed.dev/install.sh | sh
```

**Features Enabled:**
- ✅ Ruff for linting and formatting
- ✅ Basedpyright for type checking and IntelliSense
- ✅ Format on save
- ✅ Auto-import organization
- ✅ Odoo-specific path resolution
- ✅ Project-specific tasks

**Configuration Location:**
- Project settings: `.zed/settings.json`
- User settings: `~/.config/zed/settings.json` (Linux/macOS)

**Useful Keyboard Shortcuts:**
- `Cmd/Ctrl + Shift + P` - Command palette
- `Cmd/Ctrl + P` - File finder
- `Cmd/Ctrl + Shift + F` - Project-wide search
- `Cmd/Ctrl + .` - Quick actions (autofix)
- `Cmd/Ctrl + Shift + I` - Format document

**Running Tasks:**
Zed has built-in tasks defined in `.zed/settings.json`:
- Start Odoo
- Restart Odoo
- View Odoo Logs
- Odoo Shell
- Run Ruff Check
- Run Ruff Format

### VSCode

Visual Studio Code with Python extensions.

**Required Extensions:**
- Python (Microsoft)
- Pylance
- Ruff
- XML (Red Hat)
- Docker

**Installation:**
Extensions will be automatically recommended when you open the project.

**Configuration Location:**
- Workspace settings: `.vscode/settings.json`
- Extension recommendations: `.vscode/extensions.json`

## 🐍 Python Environment

### Virtual Environment Setup

**Local Development:**
```bash
# Create virtual environment
python3.11 -m venv .venv

# Activate (Linux/macOS)
source .venv/bin/activate

# Activate (Windows)
.venv\Scripts\activate

# Install Odoo in editable mode
pip install -e ./odoo

# Install dev dependencies
pip install -r requirements-dev.txt
```

**Inside Docker:**
```bash
# The Docker container already has Odoo installed
docker-compose exec odoo bash

# Install dev tools
pip install -r requirements-dev.txt
```

### Python Path Configuration

For your editor to find Odoo modules, ensure these paths are in your `PYTHONPATH`:
- `./odoo` - Odoo core
- `./addons` - Your custom modules

**Automatic Configuration:**
- Zed: Set in `.zed/settings.json` → `terminal.env.PYTHONPATH`
- VSCode: Set in `.vscode/settings.json` → `python.analysis.extraPaths`

## ✨ Code Quality Tools

### Ruff

**Run Linting:**
```bash
# Check all files
ruff check .

# Check specific directory
ruff check addons/blog_footnotes

# Auto-fix issues
ruff check --fix addons/blog_footnotes

# Watch mode (auto-fix on save)
ruff check --watch addons/
```

**Run Formatting:**
```bash
# Format all files
ruff format .

# Format specific file
ruff format addons/blog_footnotes/models/footnote.py

# Check formatting without changes
ruff format --check addons/
```

**Inside Docker:**
```bash
docker-compose exec odoo ruff check addons/
docker-compose exec odoo ruff format addons/
```

### Configuration

Ruff configuration in `pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py311"

select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
]

ignore = [
    "E501",   # Line too long
    "N802",   # Function name should be lowercase
    "B008",   # Do not perform function calls in argument defaults
]
```

### Odoo-Specific Rules

Some rules are ignored because they conflict with Odoo conventions:
- `N802` - Odoo uses camelCase for some methods (`_compute_*`, etc.)
- `B008` - Odoo uses function calls in field defaults
- `PLR0913` - Odoo models often have many arguments

## 🔍 Type Checking

### MyPy

MyPy provides static type checking for Python code.

**Run Type Checking:**
```bash
# Check all files
mypy addons/

# Check specific module
mypy addons/blog_footnotes

# Strict mode (more thorough)
mypy --strict addons/blog_footnotes/models/
```

**Inside Docker:**
```bash
docker-compose exec odoo mypy addons/blog_footnotes
```

### Type Annotations in Odoo

Example model with proper typing:

```python
from typing import Any

from odoo import api, fields, models
from odoo.tools.translate import _


class BlogFootnote(models.Model):
    """Model for managing footnotes in blog posts."""

    _name = "blog.footnote"
    _description = "Blog Footnote"

    content = fields.Html(
        string="Footnote Content",
        required=True,
        help="The actual footnote content",
    )

    @api.depends("reference_text", "sequence")
    def _compute_display_name_custom(self) -> None:
        """Compute a readable display name for the footnote."""
        for record in self:
            record.display_name_custom = f"Footnote {record.sequence}"

    @api.model
    def create(self, vals: dict[str, Any]) -> "BlogFootnote":
        """Override create to auto-assign sequence."""
        return super().create(vals)

    def name_get(self) -> list[tuple[int, str]]:
        """Return custom name for the record."""
        return [(record.id, record.reference_text) for record in self]
```

### Type Stubs

For better type checking, install type stubs:
```bash
pip install types-psycopg2 types-requests types-python-dateutil
```

## 📁 Module Structure

Standard Odoo module structure with type annotations:

```
addons/blog_footnotes/
├── __init__.py                 # Module initialization
├── __manifest__.py             # Module metadata
├── models/
│   ├── __init__.py
│   └── footnote.py            # Model with type hints
├── views/
│   ├── snippets/
│   │   ├── s_footnotes.xml    # Snippet template
│   │   └── options.xml        # Snippet options
│   └── assets.xml             # Asset bundles
├── static/
│   └── src/
│       ├── js/
│       │   ├── s_footnotes.js
│       │   └── s_footnotes_options.js
│       ├── scss/
│       │   └── s_footnotes.scss
│       └── img/
│           └── snippets_thumbs/
├── security/
│   └── ir.model.access.csv    # Access rights
└── demo/
    └── demo_data.xml          # Demo data (optional)
```

## 🎯 Best Practices

### 1. Code Style

**Line Length:**
- Maximum 100 characters (Odoo standard)
- Configured in `pyproject.toml` and `.editorconfig`

**Imports:**
- Standard library first
- Third-party packages second
- Odoo imports third
- Local imports last
- Sorted alphabetically within groups

```python
# Standard library
from typing import Any

# Odoo
from odoo import api, fields, models
from odoo.tools.translate import _

# Local
from . import other_module
```

**Docstrings:**
- Use triple double-quotes `"""`
- Include type information in docstrings
- Document parameters and return values

```python
def my_method(self, param1: str, param2: int) -> bool:
    """Short description of the method.

    Longer description if needed.

    Args:
        param1: Description of param1
        param2: Description of param2

    Returns:
        Description of return value
    """
    return True
```

### 2. Type Annotations

**Always annotate:**
- Function parameters
- Return types
- Class attributes (when not Odoo fields)

**Example:**
```python
from typing import Any

def process_data(self, data: dict[str, Any]) -> list[int]:
    """Process data and return list of IDs."""
    result: list[int] = []
    for key, value in data.items():
        result.append(int(value))
    return result
```

### 3. Odoo Conventions

**Model naming:**
- Use snake_case for model names
- Use `_name`, `_description`, `_order`, etc.

**Field naming:**
- Use snake_case for field names
- Add `_id` suffix for Many2one fields
- Add `_ids` suffix for Many2many/One2many fields

**Method naming:**
- Use snake_case
- Prefix with `_` for private methods
- Use `_compute_*` for computed fields
- Use `_inverse_*` for inverse methods

### 4. Git Workflow

**Before committing:**
```bash
# Format code
ruff format .

# Fix linting issues
ruff check --fix .

# Run type checking
mypy addons/

# Check if everything passes
ruff check . && mypy addons/
```

**Pre-commit Hooks (Optional):**
```bash
# Install pre-commit
pip install pre-commit

# Set up git hooks
pre-commit install

# Now formatting and linting run automatically on commit
```

## 🔧 Troubleshooting

### Import Errors in Editor

**Problem:** Editor can't find Odoo imports

**Solution:**
1. Ensure `PYTHONPATH` includes `./odoo` and `./addons`
2. For Zed: Check `.zed/settings.json` → `terminal.env.PYTHONPATH`
3. For VSCode: Check `.vscode/settings.json` → `python.analysis.extraPaths`
4. Restart your editor

### Ruff Not Running

**Problem:** Ruff doesn't format on save

**Solution:**
1. Check Ruff is installed: `ruff --version`
2. For Zed: Check `.zed/settings.json` → `languages.Python.formatter`
3. For VSCode: Install Ruff extension
4. Check output panel for errors

### Type Checking Errors

**Problem:** MyPy reports errors on Odoo code

**Solution:**
1. Add `# type: ignore` for known Odoo patterns
2. Configure MyPy to ignore missing imports:
   ```toml
   [tool.mypy]
   ignore_missing_imports = true
   ```
3. Install type stubs: `pip install types-*`

### Docker Container Issues

**Problem:** Can't install dev tools in container

**Solution:**
```bash
# Rebuild container with dev tools
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or install manually each time
docker-compose exec odoo pip install ruff mypy
```

### Performance Issues

**Problem:** Linting/formatting is slow

**Solution:**
1. Ruff is already very fast (10-100x faster than alternatives)
2. Exclude large directories in `pyproject.toml`:
   ```toml
   exclude = ["odoo/", ".venv/", "build/"]
   ```
3. Use Ruff instead of multiple tools

## 📚 Additional Resources

### Odoo Documentation
- [Odoo 18.0 Developer Documentation](https://www.odoo.com/documentation/18.0/developer)
- [Module Structure](https://www.odoo.com/documentation/18.0/developer/reference/backend/module)
- [QWeb Templates](https://www.odoo.com/documentation/18.0/developer/reference/frontend/qweb)

### Python Tools
- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [MyPy Documentation](https://mypy.readthedocs.io/)
- [Python Type Hints (PEP 484)](https://peps.python.org/pep-0484/)

### Editor Documentation
- [Zed Documentation](https://zed.dev/docs)
- [VSCode Python](https://code.visualstudio.com/docs/python/python-tutorial)

## 🎓 Example Module

The `blog_footnotes` module in `addons/blog_footnotes/` serves as a complete example with:
- ✅ Proper type annotations
- ✅ Odoo conventions
- ✅ Clean code structure
- ✅ XML views and snippets
- ✅ JavaScript/SCSS assets
- ✅ Security rules

Study this module to understand best practices!

## 🤝 Contributing

When contributing to custom modules:

1. **Format your code:**
   ```bash
   ruff format addons/your-module
   ```

2. **Fix linting issues:**
   ```bash
   ruff check --fix addons/your-module
   ```

3. **Check types:**
   ```bash
   mypy addons/your-module
   ```

4. **Test your module:**
   ```bash
   # Restart Odoo and test
   docker-compose restart odoo
   ```

5. **Commit with meaningful messages:**
   ```bash
   git commit -m "[blog_footnotes] Add type hints to footnote model"
   ```

---

**Happy Coding!** 🚀

For questions or issues, refer to the main [ODOO_DEV_README.md](./ODOO_DEV_README.md) or check the troubleshooting section above.