import { CMSLink } from '@/components/Link/CMSLink2'
import type { MenuBlock as MenuBlockType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'

const menuVariants = cva('flex items-center text-sm', {
  defaultVariants: {
    layout: 'responsive',
  },
  variants: {
    layout: {
      inline: 'flex-row',
      stacked: 'flex-col items-start',
      responsive: 'flex-col md:flex-row',
    },
    link: {
      inline:
        'border-b-foreground px-3 py-2 text-base font-medium hover:bg-foreground/10 hover:data-[active=true]:border-b-0 hover:data-[active=true]:pb-2 data-[active=true]:border-b-[4px] data-[active=true]:pb-1',
      stacked:
        'w-full items-start border-t border-border border-l-foreground py-4 text-lg font-medium hover:bg-foreground/10 hover:data-[active=true]:border-l-0 hover:data-[active=true]:pl-6 data-[active=true]:border-l-8 data-[active=true]:pl-4',
      responsive: '',
    },
  },
})

interface MenuBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof menuVariants> {
  menu?: MenuBlockType
}

/**
 * MenuBlock component renders a navigation menu based on menu data.
 *
 * @param menu - The array of menu items to display.
 * @param className - Additional classes for the menu container.
 * @param layout - Specifies the menu layout variant ('inline', 'stacked', or 'responsive').
 * @param props - All other HTML div props.
 *
 * @example
 * <MenuBlock menu={menuData} layout="inline" />
 */
export const MenuBlock: React.FC<MenuBlockProps> = ({ menu, className, layout, ...props }) => {
  if (!menu) return null
  return (
    <nav className={cn(menuVariants({ className, layout }))} {...props}>
      {menu.map(({ link, id }, index) => (
        <CMSLink
          key={id || `menu-item-${index}`}
          className={cn(menuVariants({ link: layout }))}
          link={link}
        />
      ))}
    </nav>
  )
}
