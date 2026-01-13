'use server'

import { auth } from '@/utilities/auth'
import config from '@payload-config'
import { logout as payloadLogout } from '@payloadcms/next/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * This file contains the logout server action, allowing callers
 * to log out users from all sessions and redirect.
 */
import { LAST_PROVIDER_COOKIE } from '@/utilities/auth'
import { cookies } from 'next/headers'

export async function logout(): Promise<void> {
  try {
    await payloadLogout({ allSessions: true, config })
    await auth.api.signOut({ headers: await headers() })
    const jar = await cookies()
    jar.delete(LAST_PROVIDER_COOKIE)
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  redirect('/login')
}
