import { isWriter } from '@/access/checkRole'
import type { User } from '@/payload-types'
import { redirect } from 'next/navigation'

/**
 * Utility functions for login and authentication handling.
 *
 * This module includes helpers for redirecting users after login based on their roles,
 * as well as utilities for handling authenticated and unauthenticated (`User | null`) states.
 *
 * In particular, it provides the logic used in both the `/api/users/me` response handling,
 * where the user may be `User | null`, and the server action login "happy path"—redirecting
 * valid users to the correct dashboard/location after authentication.
 *
 */
export const redirectToDashboard = (user?: User | null): void => {
  if (user && isWriter(user)) {
    redirect('/admin')
  }

  redirect('/')
}
