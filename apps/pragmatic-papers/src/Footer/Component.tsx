import { Logo } from "@/components/Logo"
import { Menu } from "@/components/Menu"
import { ModeToggle } from "@/components/ModeToggle"
import type { Footer } from "@/payload-types"
import { getCachedGlobal } from "@/utilities/getGlobals"
import Link from "next/link"
import { Copyright } from "./Copyright"

export async function Footer(): Promise<React.ReactElement> {
  const { navItems }: Footer = await getCachedGlobal("footer", 1)()

  return (
    <footer className="container mt-auto">
      <div className="flex flex-col gap-4 border-t border-border py-4 md:flex-row md:justify-between">
        <Link className="mb-3 flex items-center md:mb-0" href="/">
          <Logo size="sm" />
        </Link>
        <div className="flex w-full flex-col-reverse items-start justify-between md:flex-row md:items-center">
          <Menu menu={navItems} />
          <ModeToggle />
        </div>
      </div>
      <Copyright className="mb-4" copyright="Pragmatic Papers" />
    </footer>
  )
}
