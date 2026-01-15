import { MenuBlockOrEmpty } from '@/blocks/Menu/Component'
import { Logo } from '@/components/Logo'
import { OffCanvasContent } from '@/Header/OffCanvasContent'
import type { Header } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

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
  const { primaryMenu, secondaryMenu }: Header = await getCachedGlobal('header', 1)()
  return (
    <header className="border-border bg-background sticky top-0 z-50 border-b-2 py-6">
      <div className="container grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <MenuBlockOrEmpty
          className="justify-self-start [&>*]:hidden md:[&>*]:inline-flex"
          menu={primaryMenu}
        />
        <Link
          href="/"
          aria-label="Link to Home"
          className="inline-flex items-center justify-center"
        >
          <Logo love aria-hidden="true" />
        </Link>
        <MenuBlockOrEmpty
          className="justify-self-end [&>*]:hidden md:[&>*]:inline-flex [&>:last-child]:inline-flex"
          menu={secondaryMenu}
          renderAfter={<OffCanvasContent />}
        />
      </div>
    </header>
  )
}
