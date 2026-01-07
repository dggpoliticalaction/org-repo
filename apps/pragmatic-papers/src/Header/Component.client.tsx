'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { ExternalLink } from 'lucide-react'
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
      className="container grid md:grid-cols-3 gap-4 my-6 items-center"
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
      <div className="col-span-1 justify-end hidden md:flex">
        {data.callToActionButton?.enabled && (
          <Button
            type="button"
            variant="default"
            style={{
              backgroundColor: data.callToActionButton?.backgroundColor || '#000000',
              color: data.callToActionButton?.textColor || '#ffffff',
            }}
            className="hidden md:flex font-bold hover:opacity-80 transition-opacity duration-300 items-center gap-2 w-fit"
            asChild
          >
            <Link
              href={data.callToActionButton?.link?.url || '/'}
              target={data.callToActionButton?.link?.newTab ? '_blank' : '_self'}
              aria-label={`Link to ${data.callToActionButton?.link?.label}`}
              rel={data.callToActionButton?.link?.newTab ? 'noopener noreferrer' : undefined}
            >
              {data.callToActionButton?.link?.label}
              <ExternalLink className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
