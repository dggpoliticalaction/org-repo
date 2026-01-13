import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { type AuthStrategyFunctionArgs, type AuthStrategyResult } from 'payload'

export type Provider = 'discord' | 'google'

export interface OAuthEntry {
  provider: string
  providerAccountId: string
  picture?: string | null
  id?: string | null
}

export const LAST_PROVIDER_COOKIE = 'better-auth.last_provider'

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  socialProviders: {
    discord: {
      clientId: process.env.OAUTH_DISCORD_CLIENT_ID,
      clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET,
    },
  },
  plugins: [nextCookies()],
})

/**
 * Extracts the value of a cookie with the given name from a cookie header string.
 *
 * @param cookieHeader - The raw "cookie" header string from an HTTP request.
 * @param name - The name of the cookie to retrieve.
 * @returns The decoded cookie value if found, or null if not present.
 *
 * Example:
 *   getCookieValue("foo=bar; baz=qux", "baz") // returns "qux"
 */
function getCookieValue(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match && match.length ? decodeURIComponent(match[1] ?? '') : null
}

export const betterAuthStrategy = async ({
  payload,
  headers,
}: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> => {
  const session = await auth.api.getSession({
    headers,
  })

  const email = session?.user?.email
  if (!email) return { user: null }

  const cookieHeader = headers.get('cookie') ?? ''
  const provider = getCookieValue(cookieHeader, LAST_PROVIDER_COOKIE) ?? 'unknown'
  const picture = session.user.image ?? undefined

  const accounts = await auth.api.accountInfo({
    headers,
  })

  const providerAccountId = accounts ? accounts.user.id.toString() : session.user.id.toString()

  try {
    const found = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    let foundUser = found.docs?.[0]

    if (!foundUser) {
      foundUser = await payload.create({
        collection: 'users',
        data: {
          email,
          name: session.user.name ?? undefined,
          role: 'user',
          oauth: [
            {
              provider,
              providerAccountId,
              picture,
            },
          ],
        },
        overrideAccess: true,
      })
    } else if (provider !== 'unknown') {
      const existingOauth = foundUser.oauth || []
      foundUser = await payload.update({
        collection: 'users',
        id: foundUser.id,
        data: {
          oauth: [
            ...existingOauth.filter((oauth) => oauth.provider !== provider),
            {
              provider,
              providerAccountId,
              picture,
            },
          ],
        },
        overrideAccess: true,
      })
    }

    return {
      user: foundUser ? { ...foundUser, collection: 'users' } : null,
    }
  } catch (error) {
    console.error('error', error)
    return { user: null }
  }
}
