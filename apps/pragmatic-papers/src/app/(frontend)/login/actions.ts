'use server'

import type { User } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AUTH_COOKIE_KEY } from './constants'
import { redirectToDashboard } from './utils'

interface ErrorResponse {
  errors?: { message: string }[]
}

interface AuthResponse {
  message: string
  user: User
  token: string
  exp: number
}

type LoginResponse = AuthResponse | ErrorResponse

export async function login(formData: FormData): Promise<void> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  try {
    const response = await fetch(`${getServerSideURL()}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = (await response.json()) as LoginResponse

    if (!response.ok) {
      let errorMessage = 'Invalid email or password'
      if ('errors' in data && data.errors) {
        const errorMessages = data.errors.map((err: { message: string }) => err.message)
        errorMessage = errorMessages.join(', ')
      } else if ('message' in data) {
        errorMessage = data.message
      }
      redirect('/login?error=' + encodeURIComponent(errorMessage))
    }

    if ('token' in data) {
      const cookieStore = await cookies()
      cookieStore.set(AUTH_COOKIE_KEY, data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }
  } catch (error) {
    console.error('Login error:', error)
    redirect('/login?error=' + encodeURIComponent('Failed to login. Please try again.'))
  }

  redirectToDashboard()
}
