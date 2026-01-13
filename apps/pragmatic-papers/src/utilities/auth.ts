import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'

export const auth = betterAuth({
  socialProviders: {
    discord: {
      clientId: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      console.log('auth.ts', JSON.stringify(ctx, null, 2))
    }),
  },
})
