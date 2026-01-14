import { Logo } from '@/components/Logo/Logo'
import type { Header } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { ActionButton } from './ActionButton/Component'
import { HeaderNav } from './Nav'

export async function Header(): Promise<React.ReactNode> {
  const header: Header = await getCachedGlobal('header', 1)()
  const { actionButton, navItems } = header
  return (
    <header className="container my-6 grid items-center gap-4 p-4 md:grid-cols-3 md:p-6">
      <div className="hidden lg:block" />
      <div className="flex justify-center md:col-span-2 lg:col-span-1">
        <Link href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <div className={cn('flex justify-between', !navItems ? 'py-8' : '')}>
          <HeaderNav data={header} />
        </div>
      </div>
      <div className="col-span-1 hidden justify-end md:flex">
        <ActionButton {...actionButton} />
      </div>
    </header>
  )
}
