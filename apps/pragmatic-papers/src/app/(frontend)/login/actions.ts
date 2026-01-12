'use server'

import { Users } from '@/collections/Users'
import config from '@payload-config'
import { login as payloadLogin } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'
import { redirectToDashboard } from './utils'

export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'))
  }

  try {
    await payloadLogin({
      collection: Users.slug as 'users',
      config,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof Error) {
      redirect('/login?error=' + encodeURIComponent(error.message))
    }
    redirect('/login?error=' + encodeURIComponent('Failed to login. Please try again.'))
  }

  redirectToDashboard()
}
