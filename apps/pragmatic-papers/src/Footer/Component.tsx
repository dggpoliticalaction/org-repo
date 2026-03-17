import { Logo } from "@/components/Logo"
import { Menu } from "@/components/Menu"
import { ModeToggle } from "@/components/ModeToggle"
import { Separator } from "@/components/ui/separator"
import type { Footer } from "@/payload-types"
import { getCachedGlobal } from "@/utilities/getGlobals"
import Link from "next/link"
import { Copyright } from "./Copyright"

export async function Footer(): Promise<React.ReactElement> {
  const { navItems }: Footer = await getCachedGlobal("footer", 1)()

  return (
    <footer className="container mt-20 space-y-2 py-2">
      <Separator />
      <div className="flex flex-row items-center justify-between gap-2">
        <Link href="/" className="flex-1">
          <Logo size="sm" />
        </Link>
        <div className="flex flex-row items-center gap-2">
          <ModeToggle />
        </div>
      </div>
      <div className="flex flex-col-reverse items-start gap-1 md:flex-row md:items-center md:justify-between md:gap-2">
        <a
          href="https://www.digitalgroundgame.org"
          className="underline-offset-4 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Copyright copyright="Digital Ground Game" />
        </a>
        <Menu menu={navItems} />
      </div>
    </footer>
  )
}
