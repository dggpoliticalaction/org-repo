import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAuthenticated = (args: AccessArgs<User>) => boolean

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  // Basic "user" accounts should not be allowed into the admin UI.
  if (!user) {
    return false
  }
  // err on the side of caution and deny access if the user doesn't have a role
  if (!user.role) {
    return false
  }
  // prevent the lowest‑privilege role from hitting `access.admin`
  return user.role !== 'user'
}
