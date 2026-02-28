'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="flex items-center gap-3">
      {navItems.map(({ id, link }) => {
        const key = id ?? link.url ?? link.label
        return <CMSLink key={key} {...link} appearance="link" />
      })}
    </nav>
  )
}
