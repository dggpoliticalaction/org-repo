import React from 'react'

import type { MenuBlock as MenuBlockType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

interface MenuBlockProps {
  menu?: MenuBlockType
}

export const MenuBlock: React.FC<MenuBlockProps> = ({ menu }) => {
  if (!menu) return <div />
  return (
    <nav className="flex items-center gap-3 text-sm">
      {menu.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
    </nav>
  )
}
