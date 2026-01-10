import React from 'react'

import type { MenuBlock as MenuBlockType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'

interface MenuBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  menu?: MenuBlockType
  renderBefore?: React.ReactNode
  renderAfter?: React.ReactNode
}

export const MenuBlock: React.FC<MenuBlockProps> = ({
  menu,
  className,
  renderBefore,
  renderAfter,
  ...props
}) => {
  return (
    <nav className={cn('flex items-center gap-3 text-sm', className)} {...props}>
      {renderBefore}
      {menu &&
        menu.map(({ link, id }, index) => (
          <CMSLink key={id || `menu-item-${index}`} {...link} appearance="link" />
        ))}
      {renderAfter}
    </nav>
  )
}
