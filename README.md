# The Pragmatic Papers

The website for [pragmaticpapers.com](https://pragmaticpapers.com/).

Read about our current initiatives on the wiki: [Pragmatic Papers Developement Wiki](https://github.com/digitalgroundgame/pragmatic-papers/wiki)

## Requirements

```Bash
docker
Node.js version 22+
pnpm
```

## Utilities

This repo uses some additional tools:

- [Turborepo](https://turbo.build/repo) for monorepo management
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Quick Start

1. [Clone the repo](https://github.com/digitalgroundgame/pragmatic-papers.git) and `cd` into it.

2. Run `pnpm install`. The preinstall hook copies `apps/pragmatic-papers/.env` from `.env.example` if missing.

3. _(Optional)_ Set up the private display font — see [Private Font Setup](#private-font-setup) below.

4. Start dev:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:8000](http://localhost:8000).

> [!NOTE]
> **Development Migrations**
>
> You do not need to run migrations against your development database, because Drizzle will have already pushed any changes to the docker container for you.
>
> Payload uses Drizzle ORM's powerful push mode to automatically sync data changes to your database for you while in development mode. By default, this is enabled and is the suggested workflow to using Postgres and Payload while doing local development.

## Private Font Setup

The `@digitalgroundgame/fonts` package contains the proprietary display font. It is optional — the site works without it, falling back to system fonts. If you don't have access, skip this section.

If you do have access, create a **Classic GitHub Personal Access Token (PAT)** at [GitHub Settings → Tokens](https://github.com/settings/tokens) with the `read:packages` scope, then add the following to your global `~/.npmrc` (create the file if it doesn't exist):  

```
//npm.pkg.github.com/:_authToken=ghp_your_token_here
```

> **Never commit tokens.** Store installation credentials in your global `~/.npmrc` only — not in the project's `.npmrc`.

Re-run `pnpm install` after setting up your credentials. You should see `✓ Fonts copied to public/fonts` in the output.

## Development Scripts

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
