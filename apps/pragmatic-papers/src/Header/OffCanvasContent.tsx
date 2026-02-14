import { MenuBlock } from '@/blocks/Menu/Component'
import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import type { Header } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TextSearch } from 'lucide-react'
import { ActionButton } from './ActionButton/Component'
import { Copyright } from './Copyright'

export async function OffCanvasContent(): Promise<React.JSX.Element> {
  const { navItems, actionButton }: Header = await getCachedGlobal('header', 1)()
  const footerData = await getCachedGlobal('footer', 1)()
  return (
    <OffCanvasBlock
      label="Menu"
      className="flex min-h-screen flex-col gap-3"
      icon={<TextSearch className="h-5 w-5" />}
    >
      <div className="flex flex-1 flex-col gap-2">
        <MenuBlock menu={navItems} variant="stacked" />
        <ActionButton {...actionButton} />
      </div>
      <div className="flex flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-end">
        <MenuBlock menu={footerData.navItems} />
        <Copyright className="text-sm">Pragmatic Papers</Copyright>
      </div>
    </OffCanvasBlock>
  )
}
