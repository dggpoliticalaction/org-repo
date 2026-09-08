import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

let pathname = "/"
vi.mock("next/navigation", () => ({ usePathname: () => pathname }))

vi.mock("@/components/Logo/AnimatedLogo", () => ({
  // The real one pulls in the player and a 76KB animation, neither of which this is about.
  AnimatedLogo: () => <div data-testid="animated-logo" />,
}))

import { HeaderChrome, HeaderLogo, headerVariants, toneFor } from "../chrome"

describe("toneFor", () => {
  it("puts the band on the interactives and nowhere else", () => {
    expect(toneFor("/interactives")).toBe("brand")
    expect(toneFor("/interactives/federal-courts")).toBe("brand")
    expect(toneFor("/")).toBe("paper")
    expect(toneFor("/articles/something")).toBe("paper")
    expect(toneFor(null)).toBe("paper")
  })

  it("paints the band and leaves the paper alone", () => {
    expect(headerVariants({ tone: "brand" })).toContain("bg-brand")
    expect(headerVariants({ tone: "paper" })).toContain("bg-background")
    // Whatever an editor picked in the CMS, a button on the band is an outline on it.
    expect(headerVariants({ tone: "brand" })).toContain("bg-transparent")
  })
})

describe("HeaderChrome", () => {
  it("wears the tone of wherever the reader is, and says which", () => {
    pathname = "/interactives/federal-courts"
    const { container, rerender } = render(<HeaderChrome>content</HeaderChrome>)
    const header = (): HTMLElement => container.querySelector("header")!
    expect(header()).toHaveAttribute("data-header-tone", "brand")
    expect(header()).toHaveClass("bg-brand")

    pathname = "/"
    rerender(<HeaderChrome>content</HeaderChrome>)
    expect(header()).toHaveAttribute("data-header-tone", "paper")
    expect(header()).toHaveClass("bg-background")
  })
})

describe("HeaderLogo", () => {
  it("draws the wordmark on the band and sets it everywhere else", () => {
    pathname = "/interactives"
    const { container, queryByTestId, rerender } = render(<HeaderLogo />)
    expect(queryByTestId("animated-logo")).toBeInTheDocument()

    // Off the band the animation is not merely hidden — it is never reached, so neither is
    // the player it would have brought with it.
    pathname = "/articles/x"
    rerender(<HeaderLogo />)
    expect(queryByTestId("animated-logo")).not.toBeInTheDocument()
    expect(container.querySelector("svg")).toBeInTheDocument()
  })
})
