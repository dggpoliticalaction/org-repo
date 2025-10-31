import { config } from 'dotenv'

if (process.env.NODE_ENV !== 'production') {
  config()
}

const requiredEnvVars = [
  'DISCORD_CLIENT_ID',
  'DISCORD_BOT_TOKEN',
  'DISCORD_BOT_API_SECRET',
  'DISCORD_BOT_MASTER_API_TOKEN',
  'DISCORD_BOT_DEVELOPER_IDS',
] as const

export function validateEnv(): void {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`)
    }
  }

  const snowflakePattern = /^\d{17,19}$/
  const developerIds = process.env.DISCORD_BOT_DEVELOPER_IDS.split(',').map((id) => id.trim())
  if (developerIds.length === 0) {
    throw new Error('DISCORD_BOT_DEVELOPER_IDS must contain at least one ID')
  }
  for (const id of developerIds) {
    if (!snowflakePattern.test(id)) {
      throw new Error(`Invalid Discord ID in DISCORD_BOT_DEVELOPER_IDS: ${id}`)
    }
  }
}

validateEnv()

export function getDeveloperIds(): string[] {
  return process.env.DISCORD_BOT_DEVELOPER_IDS.split(',').map((id) => id.trim())
}
