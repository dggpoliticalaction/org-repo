import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import { HeaderClient } from './Component.client'
import { MenuBlock } from '@/blocks/Menu/Component'
import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { Logo } from '@/components/Logo/Logo'
import { Button } from '@/components/ui/button'
import type { Header } from '@/payload-types'
import { TextSearch } from 'lucide-react'
import Link from 'next/link'

export async function Header(): Promise<React.JSX.Element> {
  const { primaryMenu }: Header = await getCachedGlobal('header', 1)()
  return (
    <HeaderClient>
      <MenuBlock menu={primaryMenu} />
      <Link href="/">
        <Logo loading="eager" priority="high" />
      </Link>
      <nav className="flex items-center gap-3 justify-self-end text-sm">
        <Button variant="link" size="clear" className="items-center" asChild>
          <Link href="/admin" aria-label="Log In">
            Log In
          </Link>
        </Button>
        <OffCanvasBlock label="Menu" icon={<TextSearch className="h-5 w-5" />} />
      </nav>
    </HeaderClient>
  )
}
