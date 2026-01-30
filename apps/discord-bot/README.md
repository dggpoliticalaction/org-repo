# DGG Discord Bot

Uses the [discord.js](https://discord.js.org/) framework.

## Setup

1. Copy example config files.

   Run this command to create your local config and .env files:

   ```
   pnpm copy-config
   ```

2. Fill your .env - see below.

3. `pnpm install`

4. Register commands.
   - In order to use slash commands, they first [have to be registered](https://discordjs.guide/creating-your-bot/command-deployment.html).
   - Type `pnpm run commands:register` to register the bot's commands.
     - Run this script any time you change a command name, structure, or add/remove commands.
     - This is so Discord knows what your commands look like.
     - It may take up to an hour for command changes to appear.
5. `pnpm start`

## Environment Variables

The bot requires certain environment variables to be set. In development, these can be set in an `.env` file in the root of the discord-bot directory. In production, these should be set in your deployment environment.

### Required

Go here for the first two https://discord.com/developers/applications/

Find this under OAuth2

```
DISCORD_CLIENT_ID="your-discord-client-id"
```

Find this under Bot

```
DISCORD_BOT_TOKEN="your-discord-bot-token"
```

Get this from inside of the Discord app. Enable developer mode -> right click user name -> Copy ID. https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID

```
DISCORD_BOT_DEVELOPER_IDS="123456789012345678,987654321098765432" # comma-separated list of Discord user IDs
```

### Not used

Clustering Configuration (only needed if clustering.enabled is true), we will likely never cluster because it's for bots that serve 2,500+ guilds.

```
DISCORD_BOT_MASTER_API_TOKEN="token"
```

```
DISCORD_BOT_API_SECRET="secret"
```
