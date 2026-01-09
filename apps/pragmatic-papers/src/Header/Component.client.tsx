'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'
import { ActionButton } from './ActionButton/Component'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
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
      className="container my-6 grid items-center gap-4 md:grid-cols-3"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="hidden lg:block" />
      <div className="flex justify-center md:col-span-2 lg:col-span-1">
        <Link href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <div className={cn('flex justify-between', !data.navItems ? 'py-8' : '')}>
          <HeaderNav data={data} />
        </div>
      </div>
      <div className="col-span-1 hidden justify-end md:flex">
        <ActionButton {...data.actionButton} />
      </div>
    </header>
  )
}
