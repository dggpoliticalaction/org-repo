// Register @testing-library/jest-dom's matchers (toBeInTheDocument, toHaveAttribute,
// toHaveClass, ...) on Vitest's `expect`. Harmless for the node-environment
// integration project, which loads this file too but never asserts on DOM nodes.
import "@testing-library/jest-dom/vitest"

// Load .env files
import "dotenv/config"

// Testing Library waits one second by default for `findBy*`/`waitFor`. That is generous for a
// component that settles in a microtask and tight for one that awaits a mocked fetch and an
// animation — under a full parallel suite those occasionally crossed the line and failed a
// test that passes on its own. Three seconds is still well inside Vitest's 5s per-test
// timeout, so a genuine hang still fails as a hang, with the right error.
import { configure } from "@testing-library/dom"

configure({ asyncUtilTimeout: 3_000 })

// jsdom implements none of the layout/viewport observation APIs, but
// embla-carousel (and anything else that measures the viewport) reaches for
// them on mount. Stub inert versions — they never fire, which is all a
// markup-level assertion needs.
const noop = (): void => undefined

if (typeof window !== "undefined") {
  class NoopObserver {
    observe = noop
    unobserve = noop
    disconnect = noop
    takeRecords = () => []
  }

  window.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver
  window.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver

  window.matchMedia ??= (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: noop,
      removeListener: noop,
      addEventListener: noop,
      removeEventListener: noop,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}
