# The Pragmatic Papers

The website for [https://pragmaticpapers.com](https://pragmaticpapers.com/).

### Utilities

This repo has some additional tools:

- [Turborepo](https://turbo.build/repo) for monorepo management
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Requirements

```Bash
docker
Node.js version 22+
pnpm
```

### [Development Wiki](https://github.com/digitalgroundgame/pragmatic-papers/wiki)

### Quick Start

1. [Clone the repo](https://github.com/digitalgroundgame/pragmatic-papers.git) and `cd` into it.

2. Run `pnpm install`. The preinstall hook copies `apps/pragmatic-papers/.env` from `.env.example` if missing.

3. Add a **Classic GitHub Personal Access Token (PAT)**. 

   This is required to install packages from private GitHub Packages (e.g. `@digitalgroundgame/fonts`). 

   Create a __Classic Token__ at [GitHub Settings → Tokens](https://github.com/settings/tokens) with the `read:packages` scope.

   ### Mac/Linux — add to ~/.zshrc (or the environment of whatever shell you're using):

   ```
   GH_FONT_READ=ghp_your_token
   ```

   ### Windows — set a user environment variable:

   ```powershell
   [System.Environment]::SetEnvironmentVariable("GH_FONT_READ", "ghp_your_token", "User")
   ```

   > **Tip:** Restart your terminal (and IDE if it runs the install) after setting environment variables so they take effect.

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
