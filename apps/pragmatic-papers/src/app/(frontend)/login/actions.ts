'use server'

import { Users } from '@/collections/Users'
import type { User } from '@/payload-types'
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
