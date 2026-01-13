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
      console.log('auth.ts')
      if (ctx.path.startsWith('/sign-up')) {
        const newSession = ctx.context.newSession
        if (newSession) {
          console.log('newSession')
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
          console.log('user')
        }
      }
    }),
  },
})
