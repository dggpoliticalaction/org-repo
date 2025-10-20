'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Media } from '@/components/Media'
import { HeaderNav } from './Nav'
import { colors } from '@/styles/colors'

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

  const stickyClass = data.stickyHeader ? 'sticky top-0 z-50' : 'relative z-20'

  return (
    <header 
      className={`${stickyClass} bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container mx-auto px-4">
        <div className="py-4 flex justify-between items-center">
          {/* Left side - Logo and Org Name */}
          <Link href="/" className="flex items-center gap-4">
            {data.logo && typeof data.logo !== 'string' && (
              <div className="w-12 h-12">
                <Media resource={data.logo} />
              </div>
            )}
            <span 
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-departure-mono), monospace' }}
            >
              {data.organizationName || 'DGG Political Action'}
            </span>
          </Link>

          {/* Right side - Nav */}
          <HeaderNav data={data} />
        </div>
      </div>
    </header>
  )
}