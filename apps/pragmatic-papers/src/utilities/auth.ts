import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  socialProviders: {
    discord: {
      clientId: process.env.OAUTH_DISCORD_CLIENT_ID as string,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET as string,
    },
  },
})
