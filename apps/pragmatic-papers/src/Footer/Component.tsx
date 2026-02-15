import { MenuBlock } from '@/blocks/Menu/Component'
import { Logo } from '@/components/Logo'
import type { Footer } from '@/payload-types'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

export async function Footer(): Promise<React.ReactElement> {
  const { navItems }: Footer = await getCachedGlobal('footer', 1)()

  return (
    <footer className="mt-auto">
      <div className="container flex flex-col space-y-3 border-t border-border py-8 md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo love />
        </Link>
        <div className="flex flex-col-reverse items-start space-y-3 md:flex-row md:items-center">
          <ThemeSelector />
          <MenuBlock menu={navItems} />
        </div>
      </div>
    </footer>
  )
}
