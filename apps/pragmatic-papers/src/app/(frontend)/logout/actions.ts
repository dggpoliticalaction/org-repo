'use server'

import { auth } from '@/utilities/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout(): Promise<void> {
  try {
    // await payloadLogout({ allSessions: true, config })
    await auth.api.signOut({ headers: await headers() })
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  redirect('/login')
}
