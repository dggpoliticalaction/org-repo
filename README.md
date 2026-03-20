# Pragmatic-Papers Website

This repo once contained apps for the discord bot and dggpolitical action website, but it now only contains the website for pragmaticpapers.com.

## What's inside?

- `pragmatic-papers`: the Pragmatic Papers website built with payloadcms and Typescript.
- `@repo/ui`: a React component library shared by the web applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

### Utilities

This repo has some additional tools:

- [Turborepo](https://turbo.build/repo) for monorepo management
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Requirements

```Bash
docker
Node.js version 20.9.0+
pnpm
```

### [Development Wiki](https://github.com/digitalgroundgame/pragmatic-papers/wiki)

### Quick Start

1. [Clone the repo](https://github.com/digitalgroundgame/pragmatic-papers.git) and `cd` into it.

2. Run `pnpm install`. The preinstall hook copies `apps/pragmatic-papers/.env` from `.env.example` if missing.

3. **(Optional) Install private fonts.**

   The `@digitalgroundgame/fonts` package contains the proprietary display font. It is optional — the site works without it, falling back to system fonts. If you don't have access, skip this step.

   If you do have access, create a **Classic GitHub Personal Access Token (PAT)** at [GitHub Settings → Tokens](https://github.com/settings/tokens) with the `read:packages` scope, then add one of the following to your **global** `~/.npmrc` (create the file if it doesn't exist):

   **Option A — hardcode the token directly:**
   ```
   //npm.pkg.github.com/:_authToken=ghp_your_token_here
   ```

   **Option B — reference a shell environment variable (e.g. in `~/.zshrc` or `~/.bashrc`):**
   ```
   # ~/.zshrc or ~/.bashrc
   export GH_FONT_READ=ghp_your_token_here
   ```
   ```
   # ~/.npmrc
   //npm.pkg.github.com/:_authToken=${GH_FONT_READ}
   ```

   > **Never commit tokens.** Both options store credentials on your machine only — not in the project's `.npmrc`.

   Re-run `pnpm install` after adding the token. You should see `✓ Fonts copied to public/fonts` in the output.

4. Start dev:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:8000](http://localhost:8000).

> [!NOTE]
> **Dev:Migrations**
>
> You do not need to run migrations against your development database, because Drizzle will have already pushed your changes to your database for you.
>
> Payload uses Drizzle ORM's powerful push mode to automatically sync data changes to your database for you while in development mode. By default, this is enabled and is the suggested workflow to using Postgres and Payload while doing local development.

### Development Scripts

Here are the most important scripts available in the root `package.json`:

- `pnpm install`: Install dependencies (loads `.env` for org packages; creates `.env` from example if missing).
- `pnpm build`: Build application.
- `pnpm dev`: Start application in development mode.
- `pnpm dev:db`: Start the development docker containers.
- `pnpm dev:db-down`: Stop the development docker containers.
- `pnpm dev:db-nuke`: Stop the containers and remove the database volumes.
- `pnpm lint`: Lint application.
- `pnpm format`: Format application.
- `pnpm check-types`: Run typescript to check for type errors.
- `pnpm ci`: A script for running in a CI environment.

### Production Migrations

Migrations will be required for non-development database environments.
- Please refer to the offical [Payload Migration Documentation](https://payloadcms.com/docs/database/migrations)

## Useful Links

- [Payload Documentation](https://payloadcms.com/docs/getting-started/what-is-payload)
  - [Payload Migration Documentation](https://payloadcms.com/docs/database/migrations)
