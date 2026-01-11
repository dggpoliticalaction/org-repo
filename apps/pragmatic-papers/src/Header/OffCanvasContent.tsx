import { OffCanvasBlock } from '@/blocks/OffCanvas/Component'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TextSearch } from 'lucide-react'
import { MenuBlock } from '@/blocks/Menu/Component'
import type { Footer, Header } from '@/payload-types'
import { Logo } from '@/components/Logo'

const OffCanvasHeader: React.FC = () => {
  return (
    <div className="flex text-left">
      <Logo variant="stacked" />
    </div>
  )
}

export async function OffCanvasContent(): Promise<React.JSX.Element> {
  const { primaryMenu, secondaryMenu }: Header = await getCachedGlobal('header', 1)()
  const { navItems }: Footer = await getCachedGlobal('footer', 1)()
  return (
    <OffCanvasBlock
      label="Menu"
      icon={<TextSearch className="h-5 w-5" />}
      header={<OffCanvasHeader />}
    >
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2">
        {primaryMenu && <MenuBlock menu={primaryMenu} variant="stacked" />}
        {secondaryMenu && <MenuBlock menu={secondaryMenu} variant="stacked" />}
      </div>
      <div>{navItems && <MenuBlock menu={navItems} variant="stacked" />}</div>
    </OffCanvasBlock>
  )
}
