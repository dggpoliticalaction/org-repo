import { Logo } from "@/components/Logo"
import { Menu } from "@/components/Menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LinkButton } from "@/components/ui/link-button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ActionButton } from "@/Header/ActionButton/Component"
import type { Header } from "@/payload-types"
import { getCachedGlobal } from "@/utilities/getGlobals"
import { SearchIcon, TextSearch, User, XIcon } from "lucide-react"
import Link from "next/link"
import React from "react"

export async function Header(): Promise<React.JSX.Element> {
  const { navItems, actionButton }: Header = await getCachedGlobal("header", 1)()

  return (
    <>
      <header className="bg-background sticky top-0 z-50">
        <div className="container">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b py-3">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon">
                    <TextSearch className="size-6" />
                    <span className="sr-only">Menu</span>
                  </Button>
                }
              />
              <SheetContent
                className="space-y-4 data-[side=left]:w-full data-[side=left]:sm:max-w-sm"
                side="left"
                showCloseButton={false}
              >
                <SheetHeader className="flex flex-row items-center justify-between">
                  <SheetTitle className="my-2 md:my-0">
                    <Logo size="sm" />
                  </SheetTitle>
                  <SheetClose
                    render={
                      <Button variant="ghost" size="icon-lg">
                        <XIcon className="size-7" />
                        <span className="sr-only">Close</span>
                      </Button>
                    }
                  />
                </SheetHeader>
                <div className="bg-muted mx-4 mb-6 flex items-center gap-2 rounded-sm border px-3 py-2">
                  <Input
                    type="search"
                    placeholder="Search Coming Soon…"
                    disabled
                    aria-label="Search box"
                    className="border-none bg-transparent"
                  />
                  <Button variant="ghost" size="icon" disabled tabIndex={-1}>
                    <SearchIcon className="size-5" />
                    <span className="sr-only">Search</span>
                  </Button>
                </div>
                <Menu menu={navItems} layout="stacked" slot={SheetClose} />
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
              {/* <LinkButton
                variant="outline"
                className="hover:bg-foreground/10 hidden lg:flex"
                href="/admin/login"
                prefetch={false}
              >
                Log In
              </LinkButton> */}
              <Sheet>
                <SheetTrigger className="lg:hidden">
                  <User />
                  <span className="sr-only">Account</span>
                </SheetTrigger>
                <SheetContent
                  className="items-center justify-center space-y-4 py-4 data-[side=right]:w-full sm:w-3/4 data-[side=right]:sm:max-w-sm [&>button:last-child]:top-3 [&>button:last-child_svg]:size-7"
                  side="right"
                >
                  <SheetHeader>
                    <SheetTitle>Account</SheetTitle>
                  </SheetHeader>
                  <div className="w-full space-y-2 px-4">
                    <ActionButton button={actionButton} className="w-full" />
                    <LinkButton
                      variant="outline"
                      size="lg"
                      className="w-full"
                      href="/admin/login"
                      prefetch={false}
                    >
                      Log In
                    </LinkButton>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <Menu menu={navItems} layout="inline" className="hidden justify-center py-3 lg:flex" />
    </>
  )
}
