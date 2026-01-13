'use server'

import { authClient } from '@/utilities/auth-client'
import config from '@payload-config'
import { logout as payloadLogout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'

/**
 * This file contains the logout server action, allowing callers
 * to log out users from all sessions and redirect.
 */
export async function logout(): Promise<void> {
  try {
    await payloadLogout({ allSessions: true, config })
    await authClient.signOut()
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  redirect('/')
}
