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

### [Development Wiki](https://github.com/dggpoliticalaction/org-repo/wiki)

### Quick Start

1. First clone the repo if you have not done so already and then change directory into org-repo.

    ```Bash
    git clone https://github.com/dggpoliticalaction/org-repo.git
    cd org-repo
    ```

2. This repository uses `pnpm` as a package manager. install the dependencies:

    ```Bash
    pnpm install
    ```

3. Copy the example .env files

    ```Bash
    cp apps/pragmatic-papers/.env.example apps/pragmatic-papers/.env
    ```

4. Start dev environment

    ```Bash
    pnpm dev
    ```

5. Use a browser to access the application,

    [http://localhost:8000](http://localhost:8000)

> [!NOTE]
> **Dev:Migrations**
>
> You do not need to run migrations against your development database, because Drizzle will have already pushed your changes to your database for you.
>
>Payload uses Drizzle ORM's powerful push mode to automatically sync data changes to your database for you while in development mode. By default, this is enabled and is the suggested workflow to using Postgres and Payload while doing local development.

### Development Scripts

Here are the most important scripts available in the root `package.json`:

- `pnpm build`: Build all applications.
- `pnpm dev`: Start all applications in development mode.
- `pnpm dev:db`: Start the development docker containers.
- `pnpm dev:db-down`: Stop the development docker containers.
- `pnpm dev:db-nuke`: Stop the containers and remove the database volumes.
- `pnpm lint`: Lint all applications.
- `pnpm format`: Format all applications.
- `pnpm check-types`: Run typescript to check for type errors.
- `pnpm ci`: A script for running in a CI environment.

### Production Migrations

Migrations will be required for non-development database environments.
- Please refer to the offical [Payload Migration Documentation](https://payloadcms.com/docs/database/migrations)

## Useful Links

- [Payload Documentation](https://payloadcms.com/docs/getting-started/what-is-payload)
  - [Payload Migration Documentation](https://payloadcms.com/docs/database/migrations)
