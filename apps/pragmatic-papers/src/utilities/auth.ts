import config from '@payload-config'
import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { getPayload } from 'payload'

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  socialProviders: {
    discord: {
      clientId: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
    },
  },

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-in')) {
        const newSession = ctx.context.newSession
        if (newSession) {
          const payload = await getPayload({ config })

          const { docs: existingUsers } = await payload.find({
            collection: 'users',
            where: { email: { equals: newSession.user.email } },
            limit: 1,
          })

          if (existingUsers.length > 0) return

          const user = await payload.create({
            collection: 'users',
            data: {
              name: newSession.user.name,
              email: newSession.user.email,
              role: 'user',
              oauth: {
                provider: newSession.user.provider,
                providerAccountId: newSession.user.id,
                picture: newSession.user.image,
              },
            },
          })

          console.log('new user', user)
        }
      }
    }),
  },
  plugins: [nextCookies()],
})
