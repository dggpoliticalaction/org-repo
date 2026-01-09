'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'
import { ActionButton } from './ActionButton/Component'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  children: React.ReactNode
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ children }) => {
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
    <header
      className="sticky top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b-2 border-border bg-background px-4 py-6 md:px-6"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      {children}
    </header>
  )
}
