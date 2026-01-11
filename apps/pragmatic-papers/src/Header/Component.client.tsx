'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface HeaderClientProps {
  className?: string
  children: React.ReactNode
}

/**
 * This themeing code is  needs to be removed once we have a proper themeing system in place.
 * Causing unnecessary re-renders.
 * Theme should be set in the body instead.
 * @deprecated
 */
export const HeaderClient: React.FC<HeaderClientProps> = ({ children, className }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className={className} {...(theme ? { 'data-theme': theme } : {})}>
      {children}
    </header>
  )
}
