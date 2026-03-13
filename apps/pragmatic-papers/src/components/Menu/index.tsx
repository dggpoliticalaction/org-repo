import { CMSLink } from "@/components/Link/CMSLink2"
import type { MenuField } from "@/payload-types"
import { cn } from "@/utilities/utils"
import { type VariantProps, cva } from "class-variance-authority"
import React from "react"

const menuVariants = cva("flex items-center", {
  defaultVariants: {
    layout: "responsive",
  },
  variants: {
    layout: {
      inline: "flex-row gap-1",
      stacked: "flex-col items-start",
      responsive: "flex-col gap-1 md:flex-row md:gap-2",
    },
  },
})

const menuItemVariants = cva("text-primary", {
  defaultVariants: {
    layout: "responsive",
  },
  variants: {
    layout: {
      inline: "hover:underline text-sm underline-offset-4",
      stacked:
        "border-border w-full justify-start rounded-none border-0 border-t px-4 py-6 text-lg data-[active=true]:shadow-[inset_4px_0_0_var(--foreground)]",
      responsive: "hover:underline text-sm underline-offset-4",
    },
  },
})

interface MenuProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "slot">,
    VariantProps<typeof menuVariants> {
  /** Wraps each menu link. Falls back to a Fragment when undefined. */
  slot?: React.ElementType
  menu?: MenuField
}

/**
 * Menu component renders a navigation menu based on menu data.
 *
 * @param menu - The array of menu items to display.
 * @param className - Additional classes for the menu container.
 * @param layout - Specifies the menu layout variant ('inline', 'stacked', or 'responsive').
 * @param slot - Optional wrapper component for each link (e.g. SheetClose). Falls back to a Fragment.
 * @param props - All other HTML div props.
 *
 * @example
 * <Menu menu={menuData} layout="inline" />
 * <Menu menu={menuData} layout="stacked" slot={SheetClose} />
 */
export const Menu: React.FC<MenuProps> = ({ menu, className, layout, slot, ...props }) => {
  if (!menu) return null

  const Slot = slot ?? React.Fragment

  return (
    <nav>
      <ul className={cn(menuVariants({ className, layout }))} {...props}>
        {menu.map(({ link, id }, index) => {
          return (
            <li key={id || `menu-item-${index}`} className={cn(menuItemVariants({ layout }))}>
              <Slot>
                <CMSLink link={link} />
              </Slot>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
