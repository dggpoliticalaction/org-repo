import React from 'react'
import NextLink from 'next/link'

import { cn } from '@/utilities/ui'
import { type VariantProps, cva } from 'class-variance-authority'

const linkVariants = cva('transition-colors underline-offset-4', {
  defaultVariants: {
    variant: 'default',
  },
  variants: {
    variant: {
      default: 'text-primary hover:underline',
      underline: 'text-primary underline',
      muted: 'text-muted-foreground hover:text-foreground hover:underline',
      danger: 'text-red-600 dark:text-red-400 hover:text-red-600/80 dark:hover:text-red-400/80',
    },
  },
})

interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  href: string
}

export const Link: React.FC<LinkProps> = ({ children, className, variant, ...props }) => {
  return (
    <NextLink className={cn(linkVariants({ variant }), className)} {...props}>
      {children}
    </NextLink>
  )
}
