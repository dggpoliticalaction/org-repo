import { cn } from '@/utilities/ui'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { DggLIcon } from "./icons/DggLIcon"

const loveVariants = cva('mr-1 w-auto', {
  defaultVariants: {
    variant: 'responsive',
  },
  variants: {
    variant: {
      inline: 'h-9 sm:h-10 md:h-11 lg:h-12 xl:h-14',
      stacked: 'h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16',
      responsive: 'h-10 sm:h-11 md:h-12 lg:h-12 xl:h-14',
    },
  },
})


export interface LoveProps
  extends React.SVGProps<SVGSVGElement>,
  VariantProps<typeof loveVariants> { }

/**
 * Love: Decorative logo mark, often used as a "heart" or "signature" glyph for Pragmatic Papers.
 *
 * Renders a stylized logo SVG (DggLIcon) at a size appropriate for Logo usage.
 *
 * Props:
 * - variant?: "inline" | "stacked" | "responsive"
 *      Controls the displayed logo size for consistency with other Logo elements.
 * - className?: string
 *      Additional Tailwind or CSS classes.
 * - ...props: All valid SVG props are forwarded to the underlying icon.
 *
 * Example usage:
 * ```tsx
 * <Love variant="responsive" />
 * ```
 */
export const Love: React.FC<LoveProps> = ({ className, variant, ...props }) => {
  return (
    <DggLIcon className={cn(loveVariants({ className, variant }))} {...props} />
  )
}