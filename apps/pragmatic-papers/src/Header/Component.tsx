import { Logo } from '@/components/Logo'
import { Menu } from '@/components/Menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ActionButton } from '@/Header/ActionButton/Component'
import type { Header } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { SearchIcon, TextSearch, User } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export async function Header(): Promise<React.JSX.Element> {
  const { navItems, actionButton }: Header = await getCachedGlobal('header', 1)()

  return (
    <>
      <header className="sticky top-0 z-50 mt-3 space-y-3 bg-background">
        <div className="container grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-background py-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="link" size="clear" className="items-center gap-2">
                <TextSearch className="h-7 w-7" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              className="w-full space-y-4 sm:w-3/4 [&>button:last-child]:top-3 [&>button:last-child]:rounded-none [&>button:last-child_svg]:h-7 [&>button:last-child_svg]:w-7"
              side="left"
            >
              <SheetHeader>
                <SheetTitle className="my-2 md:my-0">
                  <Logo className="max-w-[80%]" />
                </SheetTitle>
              </SheetHeader>
              <div className="mb-6 flex items-center gap-2 border border-border bg-muted px-3 py-2">
                <Input
                  type="search"
                  placeholder="Search Coming Soon…"
                  disabled
                  aria-label="Search box"
                  className="border-none bg-transparent"
                />
                <Button variant="ghost" size="icon" disabled tabIndex={-1}>
                  <SearchIcon className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              </div>
              <Menu menu={navItems} layout="stacked" className="-mx-6 [&>a]:px-6" />
            </SheetContent>
          </Sheet>
          <Link
            href="/"
            aria-label="Link to Home"
            className="inline-flex items-center justify-center"
          >
            <Logo />
          </Link>
          <div className="flex items-center justify-end gap-2">
            <ActionButton className="hidden lg:flex" button={actionButton} />
            <Button className="hidden hover:bg-foreground/10 lg:flex" variant="outline" asChild>
              <Link href="/admin/login">Log In</Link>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="link" size="clear" className="lg:hidden">
                  <User className="h-7 w-7" />
                  <span className="sr-only">Account</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                className="flex w-full flex-col items-center justify-center space-y-4 py-4 sm:w-3/4 [&>button:last-child]:top-3 [&>button:last-child_svg]:h-7 [&>button:last-child_svg]:w-7"
                side="right"
              >
                <SheetHeader>
                  <SheetTitle>Account</SheetTitle>
                </SheetHeader>
                <div className="w-full space-y-2">
                  <ActionButton button={actionButton} className="w-full" />
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/login">Log In</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <Menu
        menu={navItems}
        layout="inline"
        className="container my-3 hidden items-center justify-center border-t border-border pt-3 lg:flex"
      />
    </>
  )
}
