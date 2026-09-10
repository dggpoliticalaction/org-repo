"use client"

import { useTheme } from "@wrksz/themes/client"
import { LottieLight, type LottieHandle } from "lottie-react"
import React from "react"

import { Logo, logoVariants, type LogoProps } from "@/components/Logo"
import { cn } from "@/utilities/utils"

import wordmarkWhite from "./wordmark-white.json"
import wordmark from "./wordmark.json"

/**
 * Frames from the start of the animation to a point inside the hold, where every letter is
 * drawn and the wipe has not begun. The whole thing is 110 frames at 60fps: on by ~40, wiping
 * from ~70.
 */
const DRAW_ON = [0, 60] as const

/**
 * How often the wordmark draws itself again.
 *
 * Long enough that it is a thing the page does now and then rather than a thing the page is
 * doing: a logo that loops is a status indicator, and the reader is not waiting for anything.
 */
const REPEAT_MS = 2 * 60 * 1000

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeToMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const motionIsReduced = (): boolean => window.matchMedia(REDUCED_MOTION).matches

/**
 * The wordmark drawn rather than set: the same letters as `Logo`, animating.
 *
 * It shares `logoVariants`, so it stands exactly where the static one does at every size. The
 * animation is 800×96 and the logo's viewBox is 100×12 — the same shape — which is what lets
 * the two be swapped without the header moving under the reader.
 *
 * Two files, because the letters carry their own fill rather than inheriting a colour: the
 * full-colour one on the page's own ground, and a white one where that ground is dark and
 * black letters would not be there at all.
 *
 * `LottieLight` rather than `Lottie`: the smallest of the three engines, which drops the other
 * renderers and the expression engine. This animation uses neither — checked, not assumed —
 * and the engine ships to every reader who opens the page.
 */
export function AnimatedLogo({
  className,
  size,
}: Pick<LogoProps, "className" | "size">): React.ReactElement {
  // A reader who has asked for less motion gets the letters, not the drawing of them. Lottie
  // has no opinion about that, so the choice is made before it is reached — and the server,
  // which cannot know, renders the still one, so nobody is animated at before they are asked.
  const still = React.useSyncExternalStore(subscribeToMotion, motionIsReduced, () => true)
  const { resolvedTheme } = useTheme()
  const lottie = React.useRef<LottieHandle>(null)

  // Again every couple of minutes. `segment` is what it was loaded with, so playing it again
  // is the same half of the animation the arrival drew.
  React.useEffect(() => {
    if (still) return
    const timer = setInterval(() => lottie.current?.playSegments(DRAW_ON), REPEAT_MS)
    return () => clearInterval(timer)
  }, [still])

  // The still one until both questions are answered: whether the reader wants motion, and
  // which ground the letters are being drawn on. Starting before the theme has resolved would
  // load the wrong file and then reload the right one, which is a flash of black on black.
  if (still || !resolvedTheme) return <Logo size={size} className={className} />

  return (
    <>
      {/* The size lives on the wrapper, not on the animation: the player sizes its own element
          from the animation's intrinsic 800×96 and wins, so it is given a box and told to fill
          it instead of being asked to be a certain height. */}
      <span className={cn(logoVariants({ size, className }), "block aspect-25/3")}>
        <LottieLight
          src={resolvedTheme === "dark" ? wordmarkWhite : wordmark}
          lottieRef={lottie}
          autoplay
          // Once, on arrival, and only the half of it that draws. This was built as a loader,
          // so played whole it types the wordmark on, holds it, wipes it off and ends on
          // nothing. The segment stops inside the hold, which leaves the wordmark standing
          // exactly as the static one does.
          loop={false}
          segment={DRAW_ON}
          className="size-full"
          aria-hidden="true"
        />
      </span>
      <span className="sr-only">The Pragmatic Papers Logo</span>
    </>
  )
}
