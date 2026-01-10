import { MenuBlock } from '@/blocks/Menu/Component'
import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { Logo } from '@/components/Logo'
import { HeaderClient } from '@/Header/Component.client'
import type { Header } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TextSearch } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export async function Header(): Promise<React.JSX.Element> {
  const { primaryMenu, secondaryMenu }: Header = await getCachedGlobal('header', 1)()
  return (
    <HeaderClient className="sticky top-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b-2 border-border bg-background px-4 py-6 md:px-6">
      <MenuBlock menu={primaryMenu} />
      <Link href="/" aria-label="Link to Home" className="inline-flex items-center justify-center">
        <Logo love />
      </Link>
      <MenuBlock
        className="justify-self-end"
        menu={secondaryMenu}
        renderAfter={<OffCanvasBlock label="Menu" icon={<TextSearch className="h-5 w-5" />} />}
      />
    </HeaderClient>
  )
}
