declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_CLIENT_ID: string
      DISCORD_BOT_TOKEN: string
      DISCORD_BOT_API_SECRET: string
      DISCORD_BOT_MASTER_API_TOKEN: string
      DISCORD_BOT_DEVELOPER_IDS: string // comma-separated list of Discord user IDs
      NODE_ENV: 'development' | 'production' | 'test'
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
