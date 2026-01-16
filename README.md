# DGG Political Action Org Repo

This monorepo contains the applications of the DGG Political Action organization.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `pragmatic-papers`: the Pragmatic Papers website
- `dgg-political-action`: the DGG Political Action website
- `discord-bot`: the DGG Political Action discord bot
- `@repo/ui`: a React component library shared by the web applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app uses mostly [TypeScript](https://www.typescriptlang.org/).

### Utilities

This repo has some additional tools:

- [Turborepo](https://turbo.build/repo) for monorepo management
- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting


### Requirements
```
docker
Node.js version 20.9.0+
pnpm
```

This repository uses `pnpm` as a package manager. To get started, install the dependencies:
```
pnpm install
```


### Quick Start 
1. First [clone the repo](#clone) if you have not done so already and change directory into org-repo
```
cd org-repo
```
2. copy the example .env files 
```
cp apps/pragmatic-papers/.env.example apps/pragmatic-papers/.env && cp apps/dgg-political-action/.env.example apps/dgg-political-action/.env
```
3. Start dev environment 
```
pnpm dev
```
4. open `http://localhost:8000` or `http://localhost:8000`

> [!TIP] 
> You can also start a single application by running pnpm dev in the applications root directory.
> ```
> cd apps/pragmatic-papers/
> pnpm dev
> ```
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

## Useful Links
 - [Payload Documentation](https://payloadcms.com/docs/getting-started/what-is-payload)
