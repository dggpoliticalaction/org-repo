import { USERS_DB_PK } from '@/collections/Users'
import type { User } from '@/payload-types'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import { sqlitePathFromUri } from '@/utilities/sqlitePathFromUri'
import { betterAuth, BetterAuthOptions, type OAuthProvider } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import Database from 'better-sqlite3'
import { Result } from 'node_modules/payload/dist/auth/operations/login'

const database = new Database(sqlitePathFromUri(process.env.DATABASE_URI))

const payload = await getPayloadClient()

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

async function fineUserByBetterAuthId(betterAuthId: string): Promise<User | undefined> {
  const {
    docs: [foundUser],
  } = await payload.find({
    collection: USERS_DB_PK,
    where: { betterAuthId: { equals: betterAuthId } },
    limit: 1,
  })
  return foundUser
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

async function createUser(name: string, email: string): Promise<User> {
  return payload.create({
    collection: USERS_DB_PK,
    data: { name, email, role: 'user' },
    overrideAccess: true,
  })
}

async function findOrCreateUser(name: string, email: string): Promise<User> {
  const foundUser = await findUserByEmail(email)
  if (foundUser) return foundUser
  return createUser(name, email)
}

async function loginUser({ email, password }: User): Promise<
  {
    user: User
  } & Result
> {
  if (!password) throw new Error('Password is required')
  return payload.login({ collection: USERS_DB_PK, data: { email, password } })
}

export const authConfig: BetterAuthOptions = {
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
        const session = ctx.context.newSession
        if (!session) return
        const { name, email, emailVerified } = session.user
        if (!emailVerified) return
        const user = await findOrCreateUser(name, email)
        console.log('user', user)
        if (!user || !user.password) return
        const result = await loginUser(user)
        console.log('result', result)
        return
      }
    }),
  },
  plugins: [nextCookies()],
}

export const auth = betterAuth(authConfig)
