import type { User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { cookies } from 'next/headers'
import React from 'react'
import { AUTH_COOKIE_KEY } from './constants'
import { LoginForm } from './LoginForm'
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
      <LoginForm error={error} />
    </div>
  )
}
