import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DrilldownMapClient } from "@/blocks/InteractiveMap/drilldown/DrilldownMapClient"
import { DrilldownOverviewSvg } from "@/blocks/InteractiveMap/drilldown/DrilldownOverviewSvg"
import { parseDrilldownAssetString } from "@/blocks/InteractiveMap/drilldown/parseAsset"
import { buildRegionIndex } from "@/blocks/InteractiveMap/drilldown/regions"
import { DRILLDOWN_SEARCH_SCHEMA } from "@/blocks/InteractiveMap/drilldown/search"
import { DRILLDOWN_SCHEMA, type DrilldownAsset } from "@/blocks/InteractiveMap/drilldown/types"

const display = {
  title: "name",
  shortTitle: "short",
  category: {
    field: "party",
    values: [
      { value: "R", label: "Republican", shortLabel: "R-appointed", color: "red" },
      { value: "D", label: "Democratic", shortLabel: "D-appointed", color: "blue" },
    ],
  },
  order: "since",
  status: { field: "status", supernumerary: ["senior"], labels: { senior: "Senior" } },
  seatsFact: "seats",
  cohort: "appointer",
  flags: [{ field: "chief", label: "Chief", symbol: "★" }],
  marks: [{ field: "fedsoc", label: "FedSoc" }],
  details: [
    { field: "appointer", label: "Appointed by" },
    { field: "since", format: "years-since", label: "On the bench" },
    { field: "url", format: "link", label: "Profile" },
  ],
}

const overviewPayload = {
  schema: DRILLDOWN_SCHEMA,
  seats: {
    totalFact: "seats",
    groups: [
      { fact: "seats-r", label: "R", color: "red" },
      { fact: "seats-d", label: "D", color: "blue" },
    ],
    labelFact: "short-label",
  },
  records: {
    items: [
      {
        _region: "west",
        _role: "associate",
        name: "Justice West",
        short: "Justice",
        party: "D",
        since: "2000-01-01",
      },
    ],
    display,
  },
}

const overviewSvg = `<svg viewBox="0 0 100 50">
  <g transform="scale(1,-1) translate(0,-50)">
    <path id="west" data-region-label="West" data-seats="3" data-seats-r="1" data-seats-d="1" data-short-label="W" data-summary="3 authorized" data-children-label="districts" d="M0 0 L50 0 L50 50 L0 50"/>
    <path id="east" data-region-label="East" data-seats="2" d="M50 0 L100 0 L100 50 L50 50"/>
    <path id="w1" data-parent-id="west" data-region-label="West 1" d="M0 0 L25 0 L25 50 L0 50"/>
    <path id="w2" data-parent-id="west" data-region-label="West 2" d="M25 0 L50 0 L50 50 L25 50"/>
  </g>
</svg>`

const westPayload = {
  schema: DRILLDOWN_SCHEMA,
  records: {
    items: [
      {
        _region: "west",
        _id: "a",
        name: "Ada Lovelace",
        short: "Lovelace",
        party: "D",
        status: "active",
        since: "2010-05-05",
        appointer: "P1",
        chief: true,
        url: "https://example.com/a",
      },
      {
        _region: "west",
        _id: "b",
        name: "Alan Turing",
        short: "Turing",
        party: "R",
        status: "active",
        since: "2012-05-05",
        appointer: "P2",
        fedsoc: true,
      },
      {
        _region: "west",
        _id: "c",
        name: "Grace Hopper",
        short: "Hopper",
        party: "D",
        status: "senior",
        since: "1990-05-05",
        appointer: "P1",
      },
      {
        _region: "w1",
        _id: "d",
        name: "Katherine Johnson",
        short: "Johnson",
        party: "D",
        status: "active",
        since: "2015-01-01",
        appointer: "P1",
      },
    ],
    display,
  },
}

const westSvg = `<svg viewBox="0 0 50 50">
  <g transform="scale(1,-1) translate(0,-50)">
    <path id="west" data-region-label="West" d="M0 0 L50 0 L50 50 L0 50"/>
    <path id="w1" data-parent-id="west" data-region-label="West 1" data-seats="2" d="M0 0 L25 0 L25 50 L0 50"/>
    <path id="w2" data-parent-id="west" data-region-label="West 2" data-seats="1" data-inset="true" d="M25 0 L50 0 L50 50 L25 50"/>
  </g>
</svg>`

/** A second child map, so a reader can cross from one to another. */
const eastSvg = `<svg viewBox="0 0 50 50">
  <g transform="scale(1,-1) translate(0,-50)">
    <path id="east" data-region-label="East" d="M0 0 L50 0 L50 50 L0 50"/>
    <path id="e1" data-parent-id="east" data-region-label="East 1" data-seats="2" d="M0 0 L25 0 L25 50 L0 50"/>
  </g>
</svg>`

const searchIndex = {
  schema: DRILLDOWN_SEARCH_SCHEMA,
  entries: [
    { id: "a", name: "Ada Lovelace", region: "west" },
    { id: "c", name: "Grace Hopper", region: "west" },
    { id: "d", name: "Katherine Johnson", region: "w1" },
  ],
}

/** An asset as the server composes it: geometry from an SVG, payload from the feed. */
function compose(svg: string, payload: unknown): DrilldownAsset {
  return { ...parseDrilldownAssetString(svg), payload: payload as DrilldownAsset["payload"] }
}

function setup({
  search,
  eastMap = false,
}: { search?: { url: string; label?: string }; eastMap?: boolean } = {}) {
  const overview = compose(overviewSvg, overviewPayload)
  const regions = buildRegionIndex([overview])
  const fetchMock = vi.fn(async (url: string) => {
    if (url === "/regions/west") return Response.json(compose(westSvg, westPayload))
    // East has no map unless a test asks for one — its 404 is what the error state is made of.
    if (url === "/regions/east" && eastMap)
      return Response.json(compose(eastSvg, { schema: DRILLDOWN_SCHEMA }))
    if (url === "/search") return Response.json(searchIndex)
    return new Response("nope", { status: 404 })
  })
  vi.stubGlobal("fetch", fetchMock)
  const utils = render(
    <DrilldownMapClient
      overview={{ ...overview, paths: overview.paths.map((p) => ({ ...p, d: "" })) }}
      search={search}
      childAssets={[
        { regionId: "west", url: "/regions/west" },
        { regionId: "east", url: "/regions/east" },
      ]}
    >
      <div data-drilldown-layer="overview" data-state="visible">
        <DrilldownOverviewSvg asset={overview} regions={regions} />
      </div>
    </DrilldownMapClient>,
  )
  return { ...utils, fetchMock }
}

const pane = (container: HTMLElement) =>
  container.querySelector<HTMLElement>("[data-drilldown-pane]")!
const selector = (container: HTMLElement) =>
  within(container.querySelector<HTMLElement>("[data-drilldown-selector]")!)

describe("DrilldownMapClient", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
  })
  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    window.history.replaceState(null, "", "/interactives/courts")
  })

  it("adopts the server-rendered overview: hover overlay and seat blocks are added, nothing else changes", () => {
    const { container } = setup()
    const svg = container.querySelector("svg[data-drilldown-overview]")!
    expect(svg.querySelector('path[data-drilldown-overlay=""]')).toBeInTheDocument()
    expect(svg.querySelector('path[data-drilldown-overlay="selected"]')).toBeInTheDocument()
    const blocks = svg.querySelectorAll("g[data-drilldown-block]")
    expect(Array.from(blocks).map((b) => b.getAttribute("data-region-id"))).toEqual([
      "east",
      "west",
    ])
    // west: 1 R + 1 D + 1 vacant of 3 seats
    const west = svg.querySelector('g[data-drilldown-block][data-region-id="west"]')!
    expect(west.querySelectorAll('rect[data-block-seat="filled"]')).toHaveLength(2)
    expect(west.querySelectorAll('rect[data-block-seat="vacant"]')).toHaveLength(1)
    expect(west.querySelector("text[data-block-label]")).toHaveTextContent("W")
    // interactive shapes advertise as buttons only once the stage is behind them
    expect(svg.querySelector('path[data-region-id="west"][data-role="parent"]')).toHaveAttribute(
      "role",
      "button",
    )
    expect(svg.querySelector('path[data-region-id="w1"]')).not.toHaveAttribute("role")
    // no child asset was requested for the overview
    expect(fetch).not.toHaveBeenCalled()
  })

  it("choosing a region opens its own map and its bench, and fetches its asset once", async () => {
    const { container, fetchMock } = setup()
    const item = selector(container).getByRole("button", { name: "West" })
    fireEvent.click(item)
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "child",
      ),
    )
    // inside its own map, the same item toggles the pane rather than drilling again
    fireEvent.click(item)
    fireEvent.click(item) // and open again — still one fetch
    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith("/regions/west", expect.anything())

    const p = pane(container)
    await waitFor(() =>
      expect(within(p).getAllByRole("button", { name: "Ada Lovelace" })).not.toHaveLength(0),
    )
    expect(within(p).getByText("3 authorized")).toBeInTheDocument()
    // 3 bench members (2 active, the senior folded away in the default seat chart),
    // 1 vacancy, the associate chip
    expect(p.querySelectorAll("[data-drilldown-node]")).toHaveLength(3)
    expect(p.querySelectorAll("[data-drilldown-vacancy]")).toHaveLength(1)
    expect(p.querySelector("[data-drilldown-associate-node]")).toHaveTextContent("Justice")
    // already inside it, so there is nothing left to drill into
    expect(within(p).queryByRole("button", { name: "View districts →" })).not.toBeInTheDocument()
    // its seat block carries the selection; the map it is standing on is not flooded with it
    const local = container.querySelector<HTMLElement>('[data-drilldown-layer="local"]')!
    await waitFor(() =>
      expect(local.querySelector('g[data-drilldown-block][data-region-id="west"]')).toHaveAttribute(
        "data-selected",
      ),
    )
    expect(
      local.querySelector('path[data-region-id="west"][data-role="parent"]'),
    ).not.toHaveAttribute("data-selected")
  })

  it("writes where the reader is into the address, and reads it back", async () => {
    window.history.replaceState(null, "", "/interactives/courts")
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() => expect(window.location.search).toBe("?region=west"))

    // a pinned card is part of the address too
    const p = pane(container)
    fireEvent.click(await within(p).findByRole("button", { name: "Ada Lovelace" }))
    await waitFor(() => expect(window.location.search).toBe("?region=west&record=a"))

    // and stepping back out empties it again
    fireEvent.click(
      within(container.querySelector<HTMLElement>("[data-drilldown-selector]")!).getByRole(
        "button",
        { name: "← Back to overview" },
      ),
    )
    await waitFor(() => expect(window.location.search).toBe(""))
  })

  it("restores a deep link: the child map, its region and the pinned record", async () => {
    window.history.replaceState(null, "", "/interactives/courts?region=w1&record=d")
    const push = vi.spyOn(window.history, "pushState")
    const { container } = setup()
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "child",
      ),
    )
    const p = pane(container)
    await waitFor(() => expect(p).toHaveAttribute("data-open"))
    expect(p.querySelector("[data-drilldown-pane-title]")).toHaveTextContent("West 1")
    const detail = p.querySelector<HTMLElement>("[data-drilldown-detail]")!
    await waitFor(() => expect(detail).toHaveAttribute("data-pinned"))
    expect(within(detail).getByText("Katherine Johnson")).toBeInTheDocument()
    // the region already says which map it is on, so nothing is added — and arriving
    // somewhere is not a step to go back from
    expect(window.location.search).toBe("?region=w1&record=d")
    expect(push).not.toHaveBeenCalled()
  })

  it("opens a region's children in place, without going there", async () => {
    const { container, fetchMock } = setup()
    const nav = container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    expect(within(nav).queryByRole("button", { name: "West 1" })).not.toBeInTheDocument()
    fireEvent.click(within(nav).getByRole("button", { name: "Expand West" }))
    // the children's own asset is what names them, so opening the branch fetches it
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/regions/west", expect.anything()))
    await waitFor(() =>
      expect(within(nav).getByRole("button", { name: "West 1" })).toBeInTheDocument(),
    )
    // …but the map has not moved, and nothing is selected
    expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
      "data-view",
      "overview",
    )
    expect(pane(container)).not.toHaveAttribute("data-open")
    fireEvent.click(within(nav).getByRole("button", { name: "Collapse West" }))
    expect(within(nav).queryByRole("button", { name: "West 1" })).not.toBeInTheDocument()
  })

  it("forgives a flicker across a shared border: a hover change has to settle before it counts", () => {
    vi.useFakeTimers()
    try {
      const { container } = setup()
      const svg = container.querySelector<SVGSVGElement>("svg[data-drilldown-overview]")!
      const overlay = svg.querySelector('path[data-drilldown-overlay=""]')!
      const region = (id: string) =>
        svg.querySelector(`path[data-region-id="${id}"][data-role="parent"]`)!
      // the first region of a sweep lights up at once — there is nothing to flicker against
      fireEvent.pointerOver(region("west"))
      expect(overlay).toHaveAttribute("data-visible")
      const west = overlay.getAttribute("d")
      // crossing onto the neighbour does not take effect on the spot …
      fireEvent.pointerOver(region("east"))
      expect(overlay).toHaveAttribute("d", west)
      // … and jittering back to where the pointer started cancels the change outright
      fireEvent.pointerOver(region("west"))
      vi.advanceTimersByTime(500)
      expect(overlay).toHaveAttribute("d", west)
      // staying on the neighbour is a real move
      fireEvent.pointerOver(region("east"))
      vi.advanceTimersByTime(500)
      expect(overlay).not.toHaveAttribute("d", west)
      expect(overlay).toHaveAttribute("data-visible")
      // leaving the map is unambiguous, so it clears without waiting
      fireEvent.pointerLeave(svg)
      expect(overlay).not.toHaveAttribute("data-visible")
    } finally {
      vi.useRealTimers()
    }
  })

  it("names the cohort the rings mark, and rings nobody when the cohort is one", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    const p = pane(container)
    const ada = await within(p).findByRole("button", { name: "Ada Lovelace" })
    // Ada and Grace were both appointed by P1; the caption says so, in the detail line's words
    fireEvent.pointerEnter(ada)
    expect(p.querySelector("[data-drilldown-cohort]")).toHaveTextContent("Appointed by P1 · 2 of 3")
    expect(p.querySelectorAll("[data-drilldown-node][data-cohort]")).toHaveLength(2)
    // Alan is P2's only appointee here: a cohort of one is neither ringed nor captioned
    fireEvent.pointerEnter(within(p).getByRole("button", { name: "Alan Turing" }))
    expect(p.querySelector("[data-drilldown-cohort]")).not.toBeInTheDocument()
    expect(p.querySelectorAll("[data-drilldown-node][data-cohort]")).toHaveLength(0)
  })

  it("hovering a bench member fills the docked detail panel; clicking pins it", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    const p = pane(container)
    const ada = await within(p).findByRole("button", { name: "Ada Lovelace" })
    fireEvent.pointerEnter(ada)
    const detail = p.querySelector<HTMLElement>("[data-drilldown-detail]")!
    expect(within(detail).getByText("Ada Lovelace")).toBeInTheDocument()
    expect(within(detail).getByText("★ Chief")).toBeInTheDocument()
    expect(within(detail).getByText("Appointed by:")).toBeInTheDocument()
    expect(within(detail).getByRole("link", { name: /Profile/ })).toHaveAttribute(
      "href",
      "https://example.com/a",
    )
    expect(detail).not.toHaveAttribute("data-pinned")
    fireEvent.click(ada)
    expect(detail).toHaveAttribute("data-pinned")
    // pinned: hovering someone else does not replace it
    fireEvent.pointerEnter(within(p).getByRole("button", { name: "Alan Turing" }))
    expect(within(detail).getByText("Ada Lovelace")).toBeInTheDocument()
  })

  it("seat-chart view counts the authorized bench, and folds the seniors in on request", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    const p = pane(container)
    await within(p).findByRole("button", { name: "Ada Lovelace" })
    // seats is the default view, and seniors ride alongside it: visible, outside the count
    const count = () => p.querySelector("[data-drilldown-count]")!.textContent
    expect(count()).toBe("D-appointed 1 of 2 · majority 2 (no majority)")
    expect(within(p).getByRole("button", { name: "Alongside" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    fireEvent.click(within(p).getByRole("button", { name: "Counted" }))
    expect(count()).toBe("D-appointed 2 of 3 · majority 2 ✓ · incl. senior")
  })

  it("drilling in switches the selector to the children and renders their blocks on the child layer", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "child",
      ),
    )
    // the rail keeps every region in view and opens the one drilled into, in place
    const nav = container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    expect(within(nav).getByRole("button", { name: "← Back to overview" })).toBeInTheDocument()
    expect(within(nav).getByRole("button", { name: "West 1" })).toBeInTheDocument()
    expect(within(nav).getByRole("button", { name: "East" })).toBeInTheDocument()
    expect(within(nav).getByRole("button", { name: "West" })).toHaveAttribute(
      "aria-expanded",
      "true",
    )

    const local = container.querySelector<HTMLElement>('[data-drilldown-layer="local"]')!
    expect(local).toHaveAttribute("data-parent-id", "west")
    // the circuit's own bench leads its districts, drawn in the gutter beside the map
    await waitFor(() =>
      expect(
        Array.from(local.querySelectorAll("g[data-drilldown-block]")).map((b) =>
          b.getAttribute("data-region-id"),
        ),
      ).toEqual(["west", "w1", "w2"]),
    )
    const svg = local.querySelector("svg[data-drilldown-local]")!
    const [gx, , gw] = svg.getAttribute("viewBox")!.split(" ").map(Number) as number[]
    const west = local.querySelector('g[data-drilldown-block][data-region-id="west"] rect')!
    // …in the reserved strip left of the map, not over it
    expect(Number(west.getAttribute("x"))).toBeLessThan(gx! + gw! * 0.2)
    // child paths are the interactive ones in the child view
    expect(local.querySelector('path[data-region-id="w1"]')).toHaveAttribute("role", "button")
    expect(local.querySelector('path[data-region-id="west"]')).toHaveAttribute(
      "data-role",
      "parent",
    )
    // An inset on the overview stands in for its parent, so it is painted with it; on the
    // parent's own map it is a region in its own right and must stay unpainted (a selected
    // 9th Circuit used to flood Alaska, Hawaii and Guam with the selection fill).
    expect(local.querySelector('path[data-region-id="w2"][data-inset="true"]')).not.toHaveAttribute(
      "data-selected",
    )
    expect(local.querySelector('path[data-drilldown-overlay="selected"]')).not.toHaveAttribute(
      "data-visible",
    )

    // selecting a child shows its records from the parent's asset
    fireEvent.click(within(nav).getByRole("button", { name: "West 1" }))
    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))
    // and marks it on the map: the neutral fill, plus the outline a hover would draw
    expect(local.querySelector('path[data-region-id="w1"]')).toHaveAttribute("data-selected")
    const chosen = local.querySelector('path[data-drilldown-overlay="selected"]')!
    expect(chosen).toHaveAttribute("data-visible")
    expect(chosen.getAttribute("d")).toBe(
      local.querySelector('path[data-region-id="w1"]')!.getAttribute("d"),
    )
    expect(
      within(pane(container)).getByRole("button", { name: "Katherine Johnson" }),
    ).toBeInTheDocument()

    fireEvent.click(within(nav).getByRole("button", { name: "← Back to overview" }))
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "overview",
      ),
    )
    expect(
      within(container.querySelector<HTMLElement>("[data-drilldown-selector]")!).getByRole(
        "button",
        { name: "East" },
      ),
    ).toBeInTheDocument()
  })

  it("crossing from one child map to another leaves the first behind", async () => {
    const { container } = setup({ eastMap: true })
    const nav = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    const layer = (id: string): HTMLElement | null =>
      container.querySelector<HTMLElement>(`[data-drilldown-layer="local"][data-parent-id="${id}"]`)

    fireEvent.click(within(nav()).getByRole("button", { name: "West" }))
    await waitFor(() => expect(layer("west")).not.toHaveAttribute("data-state", "hidden"))

    fireEvent.click(within(nav()).getByRole("button", { name: "East" }))
    await waitFor(() => expect(layer("east")).toBeInTheDocument())
    await waitFor(() => expect(layer("east")).not.toHaveAttribute("data-state", "hidden"))
    // There is no plan that goes from one child map straight to another, so the way across is
    // out and back in — and the map left behind is off the stage, not under the new one.
    expect(layer("west")).toHaveAttribute("data-state", "hidden")
    expect(
      container.querySelectorAll('[data-drilldown-layer="local"]:not([data-state="hidden"])'),
    ).toHaveLength(1)
    expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
      "data-view",
      "child",
    )
  })

  it("shows an error state — and stays put — when the region asset cannot be fetched", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "East" }))
    const p = pane(container)
    await waitFor(() => expect(p.querySelector("[data-drilldown-error]")).toBeInTheDocument())
    // the map it could not fetch is not the map it shows
    expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
      "data-view",
      "overview",
    )
    // and the drill control is still there, now as the retry
    expect(within(p).getByRole("button", { name: /^View / })).toBeInTheDocument()
  })

  it("Escape closes the pane and clears the selection", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(pane(container)).not.toHaveAttribute("data-open"))
    expect(container.querySelector("path[data-selected]")).not.toBeInTheDocument()
  })

  it("search is off unless the caller supplies an index", () => {
    const { container } = setup()
    expect(container.querySelector("[data-drilldown-search]")).not.toBeInTheDocument()
  })

  it("a search result selects the record's region and pins the record", async () => {
    const { container, getByRole, fetchMock } = setup({
      search: { url: "/search", label: "Search judges" },
    })
    // The index is not fetched until the reader actually searches.
    expect(fetchMock).not.toHaveBeenCalled()

    const box = getByRole("combobox", { name: "Search judges" })
    fireEvent.change(box, { target: { value: "hopper" } })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/search", expect.anything()))

    const option = await within(container).findByRole("option", { name: /Grace Hopper/ })
    expect(option).toHaveTextContent("West")
    fireEvent.click(option)

    const p = pane(container)
    await waitFor(() => expect(p).toHaveAttribute("data-open"))
    expect(p.querySelector("[data-drilldown-pane-title]")).toHaveTextContent("West")
    const detail = await waitFor(() => {
      const el = p.querySelector<HTMLElement>("[data-drilldown-detail]")!
      expect(el).toHaveAttribute("data-pinned")
      return el
    })
    expect(within(detail).getByText("Grace Hopper")).toBeInTheDocument()
    // The query is cleared, so the list does not sit over the map the reader was sent to.
    expect(box).toHaveValue("")
  })

  it("a result inside a child region drills into its parent first", async () => {
    const { container, getByRole } = setup({ search: { url: "/search" } })
    fireEvent.change(getByRole("combobox"), { target: { value: "katherine" } })
    fireEvent.click(await within(container).findByRole("option", { name: /Katherine Johnson/ }))

    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "child",
      ),
    )
    const p = pane(container)
    await waitFor(() =>
      expect(p.querySelector("[data-drilldown-pane-title]")).toHaveTextContent("West 1"),
    )
    await waitFor(() =>
      expect(p.querySelector("[data-drilldown-detail]")).toHaveAttribute("data-pinned"),
    )
  })

  it("the arrow keys walk the results and Enter takes the highlighted one", async () => {
    const { container, getByRole } = setup({ search: { url: "/search" } })
    const box = getByRole("combobox")
    fireEvent.change(box, { target: { value: "a" } })
    await within(container).findByRole("option", { name: /Ada Lovelace/ })

    const names = () =>
      within(container)
        .getAllByRole("option")
        .map((o) => o.textContent)
    expect(names()[0]).toContain("Ada Lovelace")
    fireEvent.keyDown(box, { key: "ArrowDown" })
    expect(within(container).getAllByRole("option")[1]).toHaveAttribute("aria-selected", "true")
    fireEvent.keyDown(box, { key: "Enter" })

    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))
  })

  it("Escape in the search box dismisses the list without closing the pane", async () => {
    const { container, getByRole } = setup({ search: { url: "/search" } })
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))

    const box = getByRole("combobox")
    fireEvent.change(box, { target: { value: "ada" } })
    await within(container).findByRole("option", { name: /Ada Lovelace/ })
    fireEvent.keyDown(box, { key: "Escape" })

    expect(within(container).queryByRole("option")).not.toBeInTheDocument()
    expect(pane(container)).toHaveAttribute("data-open")
  })

  it("reports an index that cannot be loaded rather than looking like no matches", async () => {
    const { container, getByRole } = setup({ search: { url: "/missing" } })
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    fireEvent.change(getByRole("combobox"), { target: { value: "ada" } })
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-search-error]")).toBeInTheDocument(),
    )
  })
})
