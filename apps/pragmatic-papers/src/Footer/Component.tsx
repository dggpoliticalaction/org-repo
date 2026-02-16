import { MenuBlock } from '@/blocks/Menu/Component'
import { Logo } from '@/components/Logo'
import type { Footer } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import { Copyright } from './Copyright'

export async function Footer(): Promise<React.ReactElement> {
  const { navItems }: Footer = await getCachedGlobal('footer', 1)()

  return (
    <footer className="container mt-auto">
      <div className="flex flex-col border-t border-border py-4 md:flex-row md:justify-between">
        <Link className="mb-3 flex items-center md:mb-0" href="/">
          <Logo love />
        </Link>
        <div className="flex flex-col-reverse items-start md:flex-row md:items-center">
          <ThemeSelector />
          <MenuBlock menu={navItems} />
        </div>
      </div>
      <Copyright className="mb-4" copyright="Pragmatic Papers" />
    </footer>
  )
}
