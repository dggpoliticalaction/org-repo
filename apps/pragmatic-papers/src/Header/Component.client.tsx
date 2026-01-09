'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { Logo } from '@/components/Logo/Logo'
import { TextSearch } from 'lucide-react'
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
      className="my-6 grid grid-cols-3 items-center gap-4 px-4 md:px-8"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <HeaderNav data={data} />
      <Link href="/">
        <Logo loading="eager" priority="high" />
      </Link>
      <div className="row flex gap-4 justify-self-end">
        <Link href="/admin">Log In</Link>
        <OffCanvasBlock label="Menu" icon={<TextSearch className="h-5 w-5" />} />
      </div>
    </header>
  )
}
