'use server'

import { Users } from '@/collections/Users'
import type { User } from '@/payload-types'
import { auth, type Provider } from '@/utilities/auth'
import config from '@payload-config'
import { login as payloadLogin } from '@payloadcms/next/auth'
import { headers } from 'next/headers'
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
 *
 * Currently not used.
 * @deprecated
 */
export async function defaultLogin(formData: FormData): Promise<void> {
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

export async function signInSocial(provider: Provider): Promise<void> {
  const response = await auth.api.signInSocial({
    headers: await headers(),
    body: {
      provider,
    },
    asResponse: true,
  })

  const location = response.headers.get('location')
  if (!location) throw new Error('No OAuth redirect URL')
  redirect(location)
}

export async function discordLogin(): Promise<void> {
  return signInSocial('discord')
}

export async function googleLogin(): Promise<void> {
  return signInSocial('google')
}
