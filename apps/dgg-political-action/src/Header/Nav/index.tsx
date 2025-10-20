'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { colors } from '@/styles/colors'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const discordLink = data?.discordLink || '/'

  return (
    <nav className="flex gap-6 items-center">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink 
            key={i} 
            {...link} 
            appearance="link"
            className="font-medium hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-departure-mono), monospace' }}
          />
        )
      })}
      
      {/* Discord Button */}
      <Link 
        href={discordLink}
        className="px-6 py-2 rounded font-medium hover:opacity-90 transition-opacity"
        style={{ 
          backgroundColor: colors.brand.red,
          color: colors.brand.white,
          fontFamily: 'var(--font-departure-mono), monospace'
        }}
      >
        Join the discord
      </Link>
    </nav>
  )
}