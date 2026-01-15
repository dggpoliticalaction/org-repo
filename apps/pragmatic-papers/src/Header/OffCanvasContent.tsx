import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TextSearch } from 'lucide-react'
import { MenuBlock } from '@/blocks/Menu/Component'
import type { Footer, Header } from '@/payload-types'
import { ActionButton } from './ActionButton/Component'
import { Copyright } from './Copyright'

export async function OffCanvasContent(): Promise<React.JSX.Element> {
  const { primaryMenu, secondaryMenu, actionButton }: Header = await getCachedGlobal('header', 1)()
  const { navItems }: Footer = await getCachedGlobal('footer', 1)()
  return (
    <OffCanvasBlock
      label="Menu"
      className="flex min-h-screen flex-col gap-3"
      icon={<TextSearch className="h-5 w-5" />}
    >
      <div className="flex flex-1 flex-col gap-2">
        <MenuBlock menu={primaryMenu} variant="stacked" />
        <MenuBlock menu={secondaryMenu} variant="stacked" />
        <ActionButton {...actionButton} />
      </div>
      <div className="flex flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-end">
        <MenuBlock menu={navItems} />
        <Copyright className="text-sm">Pragmatic Papers</Copyright>
      </div>
    </OffCanvasBlock>
  )
}
