'use client'

import { useEffect } from 'react'
import { logout } from './actions'

export default function LogoutPage(): void {
  useEffect(() => {
    logout()
  }, [])

  return
}
