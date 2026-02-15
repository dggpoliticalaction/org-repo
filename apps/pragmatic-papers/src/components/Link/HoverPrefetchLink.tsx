'use client'

import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export const HoverPrefetchLink: React.FC<React.ComponentProps<'a'>> = ({
  href = '',
  children,
  className,
  ...props
}) => {
  const [active, setActive] = useState(false)
  const pathname = usePathname()
  const isCurrent = pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={cn(className, '')}
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={() => setActive(true)}
      data-active={isCurrent}
    >
      {children}
    </Link>
  )
}
