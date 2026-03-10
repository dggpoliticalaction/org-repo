# AGENTS.md

This file provides guidance to tools like Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Turborepo monorepo for **Pragmatic Papers**, a Next.js 15 website with Payload CMS 3 as the headless CMS. PostgreSQL database via Docker, Drizzle ORM (managed by Payload).

## Commands

### Development
- `pnpm dev` — starts everything (installs deps, starts Postgres via Docker, runs Next.js dev server on port 8000)
- `pnpm dev:db` / `pnpm dev:db-down` — start/stop Postgres container
- `pnpm dev:db-nuke` — stop Postgres and delete volume data

### Quality Checks
- `pnpm lint` — ESLint across all workspaces
- `pnpm lint:ci` — lint with `--max-warnings 0` (used in CI) i.e. warnings are not allowed. Ignores only allowed for temporary debugging or exceptional circumstances.
- `pnpm lint:fix` — auto-fix lint issues
- `pnpm format` / `pnpm format:fix` — Prettier check/fix
- `pnpm check-types` — TypeScript type checking

### Build & Payload
- `pnpm build` — build all apps
- Inside `apps/pragmatic-papers/`:
  - `pnpm payload generate:types` — regenerate Payload TypeScript types
  - `pnpm payload generate:importmap` — regenerate Payload import map
  - `pnpm payload migrate` — run database migrations
  - `pnpm payload migrate:create` — create a new migration

### CI
GitHub Actions runs `pnpm lint:ci` and `pnpm check-types` on PRs to `main` and `dev`.

## Architecture

### Monorepo Structure
- **`apps/pragmatic-papers/`** — Main Next.js + Payload CMS application
- **`packages/ui/`** — Shared React component library (button, card, code)
- **`packages/eslint-config/`** — Shared ESLint configs (base, next-js, react-internal)
- **`packages/typescript-config/`** — Shared tsconfig presets (base, nextjs, react-library)

### Pragmatic Papers App (`apps/pragmatic-papers/src/`)
- **`payload.config.ts`** — Central Payload CMS configuration
- **`collections/`** — Payload collections: Articles, Pages, Users, Volumes, Media, Categories, Webhooks
- **`blocks/`** — Content blocks used in Lexical rich text: Banner, Code, Content, Footnote, Math, MediaBlock, SocialEmbed, etc.
- **`fields/`** — Custom Payload fields: colorPicker, menu, numberSlug
- **`access/`** — Access control hooks (authenticatedOrPublished, editorOrSelf, writer)
- **`app/(frontend)/`** — Public-facing Next.js pages using App Router
- **`app/(payload)/`** — Payload admin panel routes
- **`components/`** — React components for rendering blocks, pagination, rich text
- **`providers/`** — Context providers (theme, live preview)
- **`migrations/`** — Drizzle database migrations

### Path Aliases
- `@/*` → `apps/pragmatic-papers/src/*`
- `@payload-config` → `apps/pragmatic-papers/src/payload.config.ts`

### Payload CMS Patterns
- **Collections** define schema, access control, hooks, and admin UI in a single config object
- **Hooks**: Collections support lifecycle hooks (`beforeChange`, `afterChange`, `beforeDelete`, `afterDelete`, `beforeRead`, `afterRead`, `beforeValidate`) for custom logic like data transformation, side effects, and validation
- **Indexing**: Payload handles database indexing automatically based on collection config — fields with `index: true` or `unique: true` get indexed without manual migration
- **Access control**: Each collection defines `access` functions (`create`, `read`, `update`, `delete`) that determine permissions per operation
- **Blocks & Fields**: Custom block types and field types are defined as configs and registered in `payload.config.ts`; Payload auto-generates TypeScript types from them via `generate:types`

### Turbo Configuration (`turbo.json`)
- **Environment variables**: Any new `process.env.*` variable **must** be added to the `env` array in both the `build` and `ci` tasks in `turbo.json`. Without this, Turbo's cache won't invalidate when the variable changes, causing stale builds.
- The `build` and `ci` tasks are cached; `dev:*` tasks are not cached.
- `dev:next` depends on `dev:install` and `dev:db` completing first.

### Key Patterns
- **Database in dev**: Drizzle "push" mode auto-syncs schema changes — no manual migrations needed during development
- **Styling**: TailwindCSS with CSS variables (HSL) for theming
- **Content rendering**: Blocks system with Lexical rich text editor; each block has a config and a React component
- **Pre-commit hooks**: Husky + lint-staged runs Prettier and ESLint (`--max-warnings 0`) on staged files

### Requirements
- Node.js >= 20 (22 used in CI)
- pnpm 10
- Docker (for local PostgreSQL on port 9000)
