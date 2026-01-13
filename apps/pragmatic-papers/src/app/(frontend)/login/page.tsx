import { Button } from '@/components/ui/button'
import type { User } from '@/payload-types'
import { auth } from '@/utilities/auth'
import { getServerSideURL } from '@/utilities/getURL'
import config from '@payload-config'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import { discordLogin } from './actions'
import { AUTH_COOKIE_KEY } from './constants'
import { redirectToDashboard } from './utils'

interface LoginProps {
  searchParams: Promise<{ error?: string }>
}

interface AuthResponse {
  user: User | null
  collection: 'users'
  strategy: 'local-jwt'
  exp: number
  token: string
  message: string
}

/**
 * Login page for the application.
 *
 * - If the user is already authenticated (cookie exists and valid), they are redirected to the dashboard.
 * - Otherwise, renders the LoginForm component.
 * - Displays error messages passed via search params.
 *
 * Components:
 * - LoginForm: Handles email/password submission and displays errors.
 */
export default async function Login({ searchParams }: LoginProps): Promise<React.ReactElement> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (session) {
    const payload = await getPayload({ config })
    const {
      docs: [user],
    } = await payload.find({
      collection: 'users',
      where: { email: { equals: session.user.email } },
    })
    if (user) {
      redirectToDashboard(user)
    }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(AUTH_COOKIE_KEY)?.value

  if (token) {
    const response = await fetch(`${getServerSideURL()}/api/users/me`, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    })

    const { user } = (await response.json()) as AuthResponse

    redirectToDashboard(user)
  }

  const params = await searchParams
  const error = params.error ? decodeURIComponent(params.error) : null

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      {/* <LoginForm error={error} /> */}
      <form action={discordLogin}>
        <Button type="submit">Continue with Discord</Button>
      </form>
    </div>
  )
}
