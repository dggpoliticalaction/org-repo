import { MenuBlock, MenuBlockOrEmpty } from '@/blocks/Menu/Component'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ActionButton } from '@/Header/ActionButton/Component'
import type { Header } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { TextSearch, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import { Copyright } from './Copyright'

/**
 * Renders the site header including primary and secondary menus, logo, and off-canvas menu.
 *
 * - Fetches primary and secondary menus from global header data.
 * - Displays the primary menu on the left, the site logo (linked to home) in the center,
 *   and the secondary menu on the right.
 * - The rightmost menu also includes the OffCanvasContent for mobile or additional navigation.
 *
 * @returns {Promise<React.JSX.Element>} A Promise resolving to the rendered header element.
 */
export async function Header(): Promise<React.JSX.Element> {
  const { navItems, actionButton }: Header = await getCachedGlobal('header', 1)()
  const footerData = await getCachedGlobal('footer', 1)()

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-background py-6">
      <div className="container grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="link" size="clear" className="items-center gap-2">
              <TextSearch className="h-7 w-7" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-3/4" side="left">
            <div className="flex flex-1 flex-col gap-2">
              <MenuBlock menu={navItems} variant="stacked" />
            </div>
            <div className="flex flex-col flex-wrap items-start gap-3 sm:flex-row sm:items-end">
              <MenuBlock menu={footerData.navItems} />
              <Copyright className="text-sm">Pragmatic Papers</Copyright>
            </div>
          </SheetContent>
        </Sheet>
        <Link
          href="/"
          aria-label="Link to Home"
          className="inline-flex items-center justify-center"
        >
          <Logo aria-hidden="true" />
        </Link>
        <div className="flex items-center justify-end gap-2">
          <ActionButton className="hidden md:block" button={actionButton} />
          <Button className="hidden md:block" variant="outline" asChild>
            <Link href="/admin/login">Log In</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="link" size="clear" className="md:hidden">
                <User className="h-7 w-7" />
                <span className="sr-only">Account</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              className="flex w-full flex-col items-center justify-center gap-2 py-4 sm:w-3/4"
              side="right"
            >
              <ActionButton button={actionButton} className="w-full" />
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/login">Log In</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <MenuBlockOrEmpty
        className="justify-self-start [&>*]:hidden md:[&>*]:inline-flex"
        menu={navItems}
      />
    </header>
  )
}
