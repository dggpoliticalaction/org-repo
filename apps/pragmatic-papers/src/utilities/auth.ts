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
      if (ctx.path.startsWith('/sign-in/social')) {
        const newSession = ctx.context.newSession
        if (newSession) {
          console.log('newSession', JSON.stringify(newSession, null, 2))
          // payload
        }
      }
    }),
  },
})
