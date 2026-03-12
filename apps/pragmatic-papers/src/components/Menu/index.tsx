import type { MenuField } from "@/payload-types"
import { cn } from "@/utilities/ui"
import { type VariantProps, cva } from "class-variance-authority"
import React from "react"
import { CMSButton } from "../Button"

const menuVariants = cva("flex items-center", {
  defaultVariants: {
    layout: "responsive",
  },
  variants: {
    layout: {
      inline: "flex-row gap-1",
      stacked: "flex-col items-start",
      responsive: "flex-col md:flex-row md:gap-1",
    },
  },
})

interface MenuProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof menuVariants> {
  menu?: MenuField
}

/**
 * Menu component renders a navigation menu based on menu data.
 *
 * @param menu - The array of menu items to display.
 * @param className - Additional classes for the menu container.
 * @param layout - Specifies the menu layout variant ('inline', 'stacked', or 'responsive').
 * @param props - All other HTML div props.
 *
 * @example
 * <Menu menu={menuData} layout="inline" />
 */
export const Menu: React.FC<MenuProps> = ({ menu, className, layout, ...props }) => {
  if (!menu) return null
  return (
    <nav className={cn(menuVariants({ className, layout }))} {...props}>
      {menu.map(({ link, id }, index) => (
        <CMSButton
          key={id || `menu-item-${index}`}
          // className={cn(menuLinkVariants({ layout }))}
          link={link}
          variant="ghost"
          size={layout === "stacked" ? "lg" : "default"}
          className={cn({
            "border-border w-full justify-start rounded-none border-0 border-t px-4 py-6 text-lg data-[active=true]:shadow-[inset_4px_0_0_var(--foreground)]":
              layout === "stacked",
          })}
        />
      ))}
    </nav>
  )
}
