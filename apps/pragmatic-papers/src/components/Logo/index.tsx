import { LogomarkIcon } from '@/components/Logo/icons/LogomarkIcon'
import { cn } from '@/utilities/ui'
import React from 'react'
import { DggLIcon } from './icons/DggLIcon'

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  love?: boolean
}

export const Logo: React.FC<LogoProps> = ({ love, className, ...props }) => {
  return (
    <>
      {love && (
        <DggLIcon
          className={cn('mr-2 h-8 w-auto sm:h-9 md:h-10 lg:h-11 xl:h-12', className)}
          aria-hidden="true"
        />
      )}
      <LogomarkIcon
        className={cn(
          'h-5 w-auto text-black sm:h-6 md:h-7 lg:h-8 xl:h-9 dark:text-white',
          className,
        )}
        {...props}
      />
      <span className="sr-only">Pragmatic Papers Logo</span>
    </>
  )
}
