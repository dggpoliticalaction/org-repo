'use server'

import { Users } from '@/collections/Users'
import type { User } from '@/payload-types'
import { authClient } from '@/utilities/auth-client'
import config from '@payload-config'
import { login as payloadLogin } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import { redirectToDashboard } from './utils'

/**
 * Server actions for login: handles authentication workflow.
 *
 * The main export is `login`, a server action that processes login form submissions,
 * authenticates the user, handles error states, and redirects users to role-appropriate dashboards.
 *
 * Utilizes Payload CMS' authentication with the Next.js app router server actions.
 *
 * Any updates to login logic (especially redirects after login success/failure)
 * should be kept in sync with `/login/utils.ts` and related utility modules.
 */
export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  let user: User | null = null

  try {
    const result = await payloadLogin({
      collection: Users.slug as 'users',
      config,
      email,
      password,
    })

    user = result.user as User | null
  } catch (error) {
    if (error instanceof Error) {
      redirect('/login?error=' + encodeURIComponent(error.message))
    }
    redirect('/login?error=' + encodeURIComponent('Failed to login. Please try again.'))
  }

  redirectToDashboard(user)
}

type Provider = 'discord'

interface DiscordConfig {
  callbackURL: string
}

type Config = DiscordConfig // future configs

const PROVIDERS: Record<Provider, Config> = {
  discord: {
    callbackURL: '/',
  },
  // future providers
} as const

interface AuthError {
  code?: string | undefined
  message?: string | undefined
}

interface AuthData {
  redirect: boolean
  url: string
}

interface AuthDataWithToken {
  redirect: boolean
  token: string
  url: undefined
  user: {
    id: string
    createdAt: Date
    updatedAt: Date
    email: string
    emailVerified: boolean
    name: string
    image?: string | null | undefined | undefined
  }
}

type AuthResponse = AuthData | AuthDataWithToken | AuthError

// export async function signin(provider: Provider): Promise<void> {
//   const settings = PROVIDERS[provider]
//   const data = await authClient.signIn.social({
//     provider: 'discord',
//     ...settings,
//   })
// }

export async function discordLogin(): Promise<void> {
  // const settings = PROVIDERS['discord']
  const { data, error } = await authClient.signIn.social({
    provider: 'discord',
  })

  if (error) throw error
  if (!data?.url) throw new Error('No OAuth redirect URL')

  redirect(data.url)
}

// export async function requireSession() {
//   const session = await auth.api.getSession({ headers: await headers() })
//   if (!session) throw new Error('Unauthorized')
//   return session
// }
