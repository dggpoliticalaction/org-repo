import { LogomarkIcon } from '@/components/Logo/icons/LogomarkIcon'
import { cn } from '@/utilities/ui'
import React from 'react'

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  love?: boolean
}

export const Logo: React.FC<LogoProps> = ({ className, ...props }) => {
  return (
    <>
      <LogomarkIcon
        className={cn('h-6 w-auto text-foreground sm:h-7 md:h-8 lg:h-9 xl:h-10', className)}
        {...props}
      />
      <span className="sr-only">Pragmatic Papers Logo</span>
    </>
  )
}
