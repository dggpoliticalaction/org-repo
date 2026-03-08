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
          'h-7 w-auto text-black sm:h-8 md:h-9 lg:h-10 xl:h-11 dark:text-white',
          className,
        )}
        {...props}
      />
      <span className="sr-only">Pragmatic Papers Logo</span>
    </>
  )
}
