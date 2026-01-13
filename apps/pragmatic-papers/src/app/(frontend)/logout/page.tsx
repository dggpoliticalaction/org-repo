'use client'

import { useEffect } from 'react'
import { logout } from './actions'

/**
 * This page automatically logs out the user by calling the `logout` action on mount.
 * There is no visible UI; users are redirected or see the effect of logging out.
 */
export default function LogoutPage(): React.ReactNode {
  useEffect(() => {
    logout()
  }, [])

  return
}
