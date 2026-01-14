import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { ThemeSelector } from '@/components/ThemeSelector'
import type { Footer } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

export async function Footer(): Promise<React.ReactNode> {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="border-border mt-auto border-t text-black dark:text-white">
      <div className="container mx-auto flex flex-col gap-8 py-8 md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo size="xs" />
        </Link>
        <div className="flex flex-col-reverse items-start gap-4 md:flex-row md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col gap-4 md:flex-row">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-black dark:text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
