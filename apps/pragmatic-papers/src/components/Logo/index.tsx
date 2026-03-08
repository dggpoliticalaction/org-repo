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
        className={cn(
          'h-8 w-auto text-black sm:h-9 md:h-10 lg:h-11 xl:h-12 dark:text-white',
          className,
        )}
        {...props}
      />
      <span className="sr-only">Pragmatic Papers Logo</span>
    </>
  )
}
