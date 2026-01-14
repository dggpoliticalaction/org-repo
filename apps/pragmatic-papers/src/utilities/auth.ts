import type { User } from '@/payload-types'
import { sqlitePathFromUri } from '@/utilities/sqlitePathFromUri'
import { betterAuth, type OAuthProvider } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import Database from 'better-sqlite3'
import payload from 'payload'

const database = new Database(sqlitePathFromUri(process.env.DATABASE_URI))

export type Provider = 'discord' | 'google'

function isProvider(provider?: string): provider is Provider {
  if (!provider) return false
  return provider === 'discord' || provider === 'google'
}

function getProvider(params: Record<string, string>) {
  const provider = params.id
  return isProvider(provider) ? provider : undefined
}

function getAccountId(provider: Provider, accounts: OAuthProvider[]) {
  return accounts.find((account) => account.id === provider)?.options?.clientId
}

async function findUserByEmail(email: string): Promise<User | undefined> {
  const {
    docs: [foundUser],
  } = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  return foundUser
}

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  database,
  socialProviders: {
    discord: {
      clientId: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
    },
  },
  hooks: {
    after: createAuthMiddleware(async ({ path, params, ...ctx }) => {
      if (path.startsWith('/callback')) {
        const provider = getProvider(params)
        if (!provider) return
        const accountId = getAccountId(provider, ctx.context.socialProviders)
        const { name, email, image } = ctx.context.newSession?.user

        const foundUser = await findUserByEmail(email)

        if (foundUser) {
          // LOGIN
        } else {
          // CREATE
        }
        return
      }
    }),
  },
  plugins: [nextCookies()],
})
