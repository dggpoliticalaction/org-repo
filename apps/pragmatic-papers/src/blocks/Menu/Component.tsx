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
      inline: 'flex-row gap-3',
      stacked: 'flex-col items-start',
      responsive: 'flex-col md:flex-row md:gap-3',
    },
    link: {
      inline: '',
      stacked:
        'text-lg font-medium uppercase w-full border-t border-border py-4 items-start data-[active=true]:border-l-[12px] data-[active=true]:pl-3 data-[active=true]:border-l-brand hover:border-l-[12px] hover:pl-3 hover:border-l-brand',
      responsive: '',
    },
  },
})

interface MenuBlockProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof menuVariants> {
  menu?: MenuBlockType
  renderBefore?: React.ReactNode
  renderAfter?: React.ReactNode
}

/**
 * Renders a navigation menu from an array of menu items.
 * Supports layout variants: inline (horizontal), stacked (vertical), and responsive (vertical on mobile, horizontal on larger screens).
 * Allows additional content to be rendered before or after the menu items.
 */
/**
 * MenuBlock component
 *
 * Displays a navigation menu from the provided array of menu items.
 *
 * - Supports different presentation variants:
 *   - 'inline' (horizontal list),
 *   - 'stacked' (vertical list),
 *   - 'responsive' (vertical on mobile, horizontal on larger screens).
 * - Accepts optional nodes to render before or after the menu items via `renderBefore` and `renderAfter`.
 * - For each menu item, it renders a CMSLink component.
 * - Styling is applied through className and variant using class-variance-authority.
 *
 * Props:
 * - menu: Array of menu items to display.
 * - variant: Layout style for the menu.
 * - renderBefore: Optional React node displayed before menu items.
 * - renderAfter: Optional React node displayed after menu items.
 * - className: Additional CSS classes for the menu container.
 * - ...props: Additional props for the container <nav>.
 */
export const MenuBlock: React.FC<MenuBlockProps> = ({
  menu,
  className,
  layout,
  renderBefore,
  renderAfter,
  ...props
}) => {
  if (!menu) return null
  return (
    <nav className={cn(menuVariants({ layout }), className)} {...props}>
      {renderBefore}
      {menu.map(({ link, id }, index) => (
        <CMSLink
          key={id || `menu-item-${index}`}
          className={cn(menuVariants({ link: layout }))}
          link={link}
        />
      ))}
      {renderAfter}
    </nav>
  )
}
