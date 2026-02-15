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
      stacked: 'flex-col items-start gap-2',
      responsive: 'flex-col md:flex-row gap-2 md:gap-3',
    },
    linkWrapper: {
      inline: '',
      stacked: 'w-full border-t border-border py-4 items-start',
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
        <CMSLink key={id || `menu-item-${index}`} className={cn(menuVariants({ linkWrapper: layout }), "uppercase font-bold text-base")} link={link} />
      ))}
      {renderAfter}
    </nav>
  )
}

type MenuBlockOrEmptyProps = Omit<MenuBlockProps, 'menu'> & {
  menu?: MenuBlockType
}

/**
 * MenuBlockOrEmpty component
 *
 * - Renders the MenuBlock component if a `menu` prop is provided and truthy.
 * - If no menu is present, renders an empty <div> to preserve layout structure.
 * - Useful for grid layouts where maintaining the grid cell is important,
 *   even when no menu items exist (such as in header or footer).
 *
 * Props:
 * - menu: Optional array of menu items; if not provided or empty, renders an empty div.
 * - ...props: Additional props are passed to either MenuBlock or the empty <div>.
 */
export const MenuBlockOrEmpty: React.FC<MenuBlockOrEmptyProps> = ({ menu, ...props }) => {
  return menu ? <MenuBlock menu={menu} {...props} /> : <div {...props} />
}
