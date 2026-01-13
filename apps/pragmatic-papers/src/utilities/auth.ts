import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'

export type Provider = 'discord' | 'google'

function isProvider(provider?: string): provider is Provider {
  if (!provider) return false
  return provider === 'discord' || provider === 'google'
}

export interface OAuthEntry {
  provider: string
  providerAccountId: string
  picture?: string | null
  id?: string | null
}

function getProvider(params: Record<string, string>) {
  const provider = params.id
  return isProvider(provider) ? provider : undefined
}

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  // database: new Database(process.env.DATABASE_URI),
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
        console.log('provider', provider)
        if (!provider) return
        return
      }
    }),
  },
  plugins: [nextCookies()],
})

// async function getConnectionId(headers: Headers) {
//   const accounts = await auth.api.accountInfo({
//     headers,
//   })
//   return accounts?.user.id.toString()
// }

// async function findConnection(payload: Payload, provider: string, providerAccountId: string) {
//   const connection = await payload.find({
//     collection: 'connections',
//     where: { providerAccountId: { equals: providerAccountId }, provider: { equals: provider } },
//     limit: 1,
//     overrideAccess: true,
//   })
//   return connection.docs?.[0]
// }

// async function findOrCreateUser(payload: Payload, email: string) {
//   return payload.find({
//     collection: 'users',
//     where: { email: { equals: email } },
//     limit: 1,
//     overrideAccess: true,
//   })
// }

// export const betterAuthStrategy = async ({
//   payload,
//   headers,
// }: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> => {
//   console.log('headers', headers)
//   console.log('payload', payload)
//   // is this what we want to do?
//   const isAdminUI = await checkAdminUI(headers)
//   if (isAdminUI) return { user: null }

//   const session = await auth.api.getSession({
//     headers,
//   })

//   // const email = session?.user?.email
//   // const emailVerified = session?.user?.emailVerified
//   // if (!email || !emailVerified) return { user: null }

//   const provider = await getProviderCookie(headers)

//   if (!provider) return { user: null }

//   const providerAccountId = await getConnectionId(headers)

//   if (!providerAccountId) return { user: null }

//   const picture = session?.user?.image || null

//   const connection = await findConnection(payload, provider, providerAccountId)

//   // if (!connection) {

//   // try {
//   //   // look for existing connection
//   //   const foundUser = await findOrCreateUser(payload, email)

//   //   let foundConnection = connection.docs?.[0]

//   //   if (!foundConnection) {
//   //     foundConnection = await payload.create({
//   //       collection: 'connections',
//   //       data: {
//   //         provider,
//   //         providerAccountId,
//   //         picture,
//   //       },
//   //     })
//   //     // create new connection
//   //     // foundUser = await payload.create({
//   //     //   collection: 'users',
//   //     //   data: {
//   //     //     email,
//   //     //     name: session.user.name ?? undefined,
//   //     //     role: 'user',
//   //     //     oauth: [
//   //     //       {
//   //     //         provider,
//   //     //         providerAccountId,
//   //     //         picture,
//   //     //       },
//   //     //     ],
//   //     //   },
//   //     //   overrideAccess: true,
//   //     // })
//   //   } else if (provider !== 'unknown') {
//   //     const existingOauth = foundConnection.oauth || []
//   //     foundConnection = await payload.update({
//   //       collection: 'users',
//   //       id: foundConnection.id,
//   //       data: {
//   //         oauth: [
//   //           ...existingOauth.filter((oauth) => oauth.provider !== provider),
//   //           {
//   //             provider,
//   //             providerAccountId,
//   //             picture,
//   //           },
//   //         ],
//   //       },
//   //       overrideAccess: true,
//   //     })
//   //   }

//   //   return {
//   //     user: foundConnection ? { ...foundConnection, collection: 'users' } : null,
//   //   }
//   // } catch (error) {
//   //   console.error('error', error)
//   //   return { user: null }
//   // }
// }
