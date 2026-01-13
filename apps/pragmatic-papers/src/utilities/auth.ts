import config from '@payload-config'
import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { getPayload } from 'payload'

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
      if (ctx.path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession
        if (newSession) {
          console.log('newSession', JSON.stringify(newSession, null, 2))
          // payload
          const payload = await getPayload({ config })
          const user = await payload.create({
            collection: 'users',
            data: {
              name: newSession.user.name,
              email: newSession.user.email,
              role: 'user',
              // oauth: {
              //   provider: newSession.provider,
              //   providerAccountId: newSession.providerAccountId,
              //   picture: newSession.user.image,
              // },
            },
          })
          console.log('user', JSON.stringify(user, null, 2))
        }
      }
    }),
  },
})
