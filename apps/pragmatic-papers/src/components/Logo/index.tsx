import { LogoInline } from '@/components/Logo/icons/LogoInline'
import { LogoStacked } from '@/components/Logo/icons/LogoStacked'
import { cn } from '@/utilities/ui'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'
import { DggLIcon } from './icons/DggLIcon'

const loveVariants = cva('mr-1 w-auto', {
  defaultVariants: {
    variant: 'responsive',
  },
  variants: {
    variant: {
      inline: 'h-9 sm:h-10 md:h-11 lg:h-12 xl:h-14',
      stacked: 'h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16',
      responsive: 'h-10 sm:h-11 md:h-14 lg:h-14 xl:h-16',
    },
  },
})

const logoVariants = cva('', {
  defaultVariants: {
    variant: 'responsive',
  },
  variants: {
    variant: {
      inline: 'h-6 sm:h-7 md:h-8 lg:h-9 xl:h-10',
      stacked: 'h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16',
      responsive: '',
    },
    responsive: {
      inline: 'hidden lg:block',
      stacked: 'block pr-2 lg:hidden sm:pr-0',
    },
  },
})

export interface LogoRootProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof logoVariants> {}

export const LogoRoot: React.FC<LogoRootProps> = ({ className, variant, ...props }) => {
  switch (variant) {
    case 'stacked':
      return <LogoStacked className={cn(logoVariants({ className, variant }))} {...props} />
    case 'inline':
      return <LogoInline className={cn(logoVariants({ className, variant }))} {...props} />
    case 'responsive':
    default:
      return (
        <>
          <LogoInline
            className={cn(logoVariants({ className, variant: 'inline', responsive: 'inline' }))}
            {...props}
          />
          <LogoStacked
            className={cn(logoVariants({ className, variant: 'stacked', responsive: 'stacked' }))}
            {...props}
          />
        </>
      )
  }
}

export interface LogoProps
  extends React.SVGProps<SVGSVGElement>,
    VariantProps<typeof logoVariants> {
  love?: boolean
}

export const Logo: React.FC<LogoProps> = ({ love, variant, ...props }) => {
  return (
    <>
      {love && (
        <DggLIcon className={cn(loveVariants({ variant }))} aria-hidden={props['aria-hidden']} />
      )}
      <LogoRoot className="w-full text-black dark:text-white" variant={variant} {...props} />
    </>
  )
}
