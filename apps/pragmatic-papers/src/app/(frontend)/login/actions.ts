'use server'

import { getServerSideURL } from '@/utilities/getURL'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

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

    const data = await response.json()

    if (!response.ok) {
      // Handle different error cases
      let errorMessage = 'Invalid email or password'
      if (data.errors) {
        const errorMessages = data.errors.map((err: { message: string }) => err.message)
        errorMessage = errorMessages.join(', ')
      } else if (data.message) {
        errorMessage = data.message
      }
      redirect('/login?error=' + encodeURIComponent(errorMessage))
    }

    // Set the token cookie
    if (data.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
    }

    // Redirect on success
    redirect('/')
  } catch (error) {
    console.error('Login error:', error)
    redirect('/login?error=' + encodeURIComponent('Failed to login. Please try again.'))
  }
}
