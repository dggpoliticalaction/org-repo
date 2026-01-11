import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TextSearch } from 'lucide-react'
import { MenuBlock } from '@/blocks/Menu/Component'
import type { Footer, Header } from '@/payload-types'
import { Logo } from '@/components/Logo'
import { ActionButton } from './ActionButton/Component'
import { Copyright } from './Copyright'

const OffCanvasHeader: React.FC = () => {
  return (
    <div className="my-6 flex text-left">
      <Logo variant="stacked" love />
    </div>
  )
}

export async function OffCanvasContent(): Promise<React.JSX.Element> {
  const { primaryMenu, secondaryMenu, actionButton }: Header = await getCachedGlobal('header', 1)()
  const { navItems }: Footer = await getCachedGlobal('footer', 1)()
  return (
    <OffCanvasBlock
      label="Menu"
      className="flex min-h-screen flex-col gap-3"
      icon={<TextSearch className="h-5 w-5" />}
      header={<OffCanvasHeader />}
    >
      <div className="flex flex-1 flex-col gap-2">
        <MenuBlock menu={primaryMenu} variant="stacked" />
        <MenuBlock menu={secondaryMenu} variant="stacked" />
        <ActionButton {...actionButton} />
      </div>
      <div className="flex flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-end">
        <Logo variant="stacked" love />
        <MenuBlock menu={navItems} />
        <Copyright className="text-sm">Pragmatic Papers</Copyright>
      </div>
    </OffCanvasBlock>
  )
}
