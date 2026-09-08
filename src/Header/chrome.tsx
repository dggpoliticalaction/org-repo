"use client"

import { type VariantProps, cva } from "class-variance-authority"
import { usePathname } from "next/navigation"
import React from "react"

import { AnimatedLogo } from "@/components/Logo/AnimatedLogo"
import { Logo } from "@/components/Logo"
import { cn } from "@/utilities/utils"

/**
 * The header's two skins.
 *
 * `paper` is the site's: the page's own ground, a rule beneath it, everything inheriting.
 * `brand` is the interactives': the masthead orange, white on top of it, the rule gone because
 * a coloured band already ends where it ends. An interactive is a full-width thing a reader
 * arrives at from elsewhere, and the band is what says so before the map has drawn.
 *
 * A variant rather than a second header, because there is only one header — the same globals,
 * the same menus, the same markup. What changes is what it is painted in.
 */
export const headerVariants = cva("sticky top-0 z-50", {
  variants: {
    tone: {
      paper: "bg-background",
      // The band carries its own foreground, so the menus, icons and rules inside it take
      // white without each being told. The buttons cannot: their variants are chosen by an
      // editor in the CMS and half of them paint themselves the same orange as the ground, so
      // they are restated here as outlines on it.
      brand: [
        "bg-brand text-white [--border:color-mix(in_oklab,white_28%,transparent)]",
        "[&_[data-slot=button]]:border-white/70 [&_[data-slot=button]]:bg-transparent [&_[data-slot=button]]:text-white",
        "[&_[data-slot=button]]:border [&_[data-slot=button]]:hover:bg-white/15",
      ],
    },
  },
  defaultVariants: { tone: "paper" },
})

export type HeaderTone = NonNullable<VariantProps<typeof headerVariants>["tone"]>

/** The one place the rule lives: which routes wear which skin. */
export function toneFor(pathname: string | null): HeaderTone {
  return pathname?.startsWith("/interactives") ? "brand" : "paper"
}

/**
 * The header's element, painted for wherever the reader is.
 *
 * A client component around server-rendered children: the markup, the globals and the menus
 * are all still built on the server and handed in, and what crosses the boundary is one word
 * about the current path.
 */
export function HeaderChrome({ children }: { children: React.ReactNode }): React.ReactElement {
  const tone = toneFor(usePathname())
  return (
    <header data-header-tone={tone} className={headerVariants({ tone })}>
      {children}
    </header>
  )
}

/**
 * The wordmark for wherever the reader is: drawn on the branded band, set everywhere else.
 *
 * The animation only reaches a reader who lands on an interactive — it is imported by this
 * component and this component is only mounted there.
 */
export function HeaderLogo({ className }: { className?: string }): React.ReactElement {
  return toneFor(usePathname()) === "brand" ? (
    <AnimatedLogo className={className} />
  ) : (
    <Logo className={cn(className)} />
  )
}
