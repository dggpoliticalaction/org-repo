'use server'

import config from '@payload-config'
import { logout as payloadLogout } from '@payloadcms/next/auth'
import { redirect } from 'next/navigation'

export async function logout(): Promise<void> {
  try {
    await payloadLogout({ allSessions: true, config })
  } catch (error) {
    throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  redirect('/')
}
