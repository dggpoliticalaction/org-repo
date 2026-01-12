'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'

export async function loginUser(email: string, password: string) {
  try {
    const payload = await getPayload({ config: configPromise })

    const result = await payload.login({
      collection: 'users',
      data: {
        email,
        password,
      },
    })

    if (result.token) {
      const cookieStore = await cookies()
      cookieStore.set('payload-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      })

      return { success: true, user: result.user }
    }

    return { success: false, error: 'Login failed' }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during login',
    }
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
    return { success: true }
  } catch (error) {
    console.error('Logout error:', error)
    return { success: false, error: 'Failed to logout' }
  }
}
