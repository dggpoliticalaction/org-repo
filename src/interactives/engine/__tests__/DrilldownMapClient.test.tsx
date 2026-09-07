import { act, cleanup, fireEvent, render, waitFor, within } from "@testing-library/react"
import React from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { DrilldownMapClient } from "@/interactives/engine/DrilldownMapClient"
import { DrilldownOverviewSvg } from "@/interactives/engine/DrilldownOverviewSvg"
import { parseDrilldownAssetString } from "@/interactives/engine/parseAsset"
import { buildRegionIndex } from "@/interactives/engine/regions"
import { DRILLDOWN_SEARCH_SCHEMA } from "@/interactives/engine/search"
import { DRILLDOWN_SCHEMA, type DrilldownAsset } from "@/interactives/engine/types"

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
  icons: { byRegion: { east: "landmark" }, byLayer: { circuit: "scale" } },
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
    <path id="west" data-layer="circuit" data-region-label="West" data-seats="3" data-seats-r="1" data-seats-d="1" data-short-label="W" data-summary="3 authorized" data-children-label="districts" d="M0 0 L50 0 L50 50 L0 50"/>
    <path id="east" data-layer="circuit" data-region-label="East" data-seats="2" d="M50 0 L100 0 L100 50 L50 50"/>
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
  strict = false,
}: { search?: { url: string; label?: string }; eastMap?: boolean; strict?: boolean } = {}) {
  const overview = compose(overviewSvg, overviewPayload)
  const regions = buildRegionIndex([overview])
  // A region arrives in two halves, as the routes serve them: shapes from a hashed URL that
  // never changes, records from one that changes with the sync.
  const halves = (svg: string, payload: unknown) => {
    const whole = compose(svg, payload)
    return {
      geometry: { ...whole, payload: null },
      data: { viewBox: null, flipY: false, paths: [], payload, payloadError: null },
    }
  }
  const west = halves(westSvg, westPayload)
  const east = halves(eastSvg, { schema: DRILLDOWN_SCHEMA })
  const fetchMock = vi.fn(async (url: string) => {
    if (url === "/regions/west") return Response.json(west.data)
    if (url === "/regions/west/geometry/w1") return Response.json(west.geometry)
    // East has no map unless a test asks for one — its 404 is what the error state is made of.
    if (url.startsWith("/regions/east") && eastMap)
      return Response.json(url.includes("/geometry/") ? east.geometry : east.data)
    if (url === "/search") return Response.json(searchIndex)
    return new Response("nope", { status: 404 })
  })
  vi.stubGlobal("fetch", fetchMock)
  // Strict Mode mounts, tears down and mounts again, which is what development does to the
  // stage: a second one is built while the state from the first is still standing.
  const wrapper = strict
    ? ({ children }: { children: React.ReactNode }) => (
        <React.StrictMode>{children}</React.StrictMode>
      )
    : undefined
  const utils = render(
    <DrilldownMapClient
      overview={{ ...overview, paths: overview.paths.map((p) => ({ ...p, d: "" })) }}
      search={search}
      childAssets={[
        { regionId: "west", url: "/regions/west", geometryUrl: "/regions/west/geometry/w1" },
        { regionId: "east", url: "/regions/east", geometryUrl: "/regions/east/geometry/e1" },
      ]}
    >
      <div data-drilldown-layer="overview" data-state="visible">
        <DrilldownOverviewSvg asset={overview} regions={regions} />
      </div>
    </DrilldownMapClient>,
    { wrapper },
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
    fireEvent.click(item) // and open again — still one fetch of each half
    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))
    expect(fetchMock.mock.calls.map(([u]) => u)).toEqual([
      "/regions/west",
      "/regions/west/geometry/w1",
    ])

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
    await waitFor(() => expect(window.location.search).toBe("?region=west&pane=1"))

    // a pinned card is part of the address too
    const p = pane(container)
    fireEvent.click(await within(p).findByRole("button", { name: "Ada Lovelace" }))
    await waitFor(() => expect(window.location.search).toBe("?region=west&pane=1&record=a"))

    // and stepping back out empties it again
    fireEvent.click(
      within(container.querySelector<HTMLElement>("[data-drilldown-selector]")!).getByRole(
        "button",
        { name: "Back to overview" },
      ),
    )
    await waitFor(() => expect(window.location.search).toBe(""))
  })

  it("puts the pane's own open state in the address, and reads it back", async () => {
    window.history.replaceState(null, "", "/interactives/courts")
    const { container } = setup()
    const toggle = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-pane-toggle]")!

    // The address is not written until it has first been read, so let the mount settle.
    await act(async () => {
      await Promise.resolve()
    })

    // Open on the overview: no region says it, so the address has to.
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    fireEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    await waitFor(() => expect(window.location.search).toBe("?pane=1"))
    fireEvent.click(toggle())
    await waitFor(() => expect(window.location.search).toBe(""))

    // A region says it by itself, so the flag would be saying it twice.
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() => expect(window.location.search).toBe("?region=west&pane=1"))

    cleanup()
    window.history.replaceState(null, "", "/interactives/courts?pane=1")
    const restored = setup()
    await waitFor(() =>
      expect(restored.container.querySelector("[data-drilldown-sheet]")).toHaveAttribute(
        "data-open",
      ),
    )
  })

  it("records where a move lands, not the maps it passed through", async () => {
    window.history.replaceState(null, "", "/interactives/courts")
    const { container } = setup()
    const nav = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    const push = vi.spyOn(window.history, "pushState")
    const entries = (): (string | URL | null | undefined)[] => push.mock.calls.map((c) => c[2])

    fireEvent.click(within(nav()).getByRole("button", { name: "West" }))
    await waitFor(() => expect(window.location.search).toBe("?region=west&pane=1"))
    fireEvent.click(within(nav()).getByRole("button", { name: "Back to overview" }))
    await waitFor(() => expect(window.location.search).toBe(""))
    push.mockClear()

    // One click, one entry: the circuit's map is where the district is drawn, not a place the
    // reader stopped, so Back from here belongs to the overview they set out from.
    fireEvent.click(within(nav()).getByRole("button", { name: "West 1" }))
    await waitFor(() => expect(window.location.search).toBe("?region=w1&pane=1"))
    expect(entries()).toEqual(["/interactives/courts?region=w1&pane=1"])
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
    expect(window.location.search).toBe("?region=w1&record=d&pane=1")
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
    // A closed branch shrinks away rather than vanishing, so it is on screen — inert, and
    // marked as leaving — until the transition it is in is over.
    expect(nav.querySelector("[data-drilldown-branch]")).toHaveAttribute(
      "data-drilldown-branch",
      "closing",
    )
    await waitFor(() =>
      expect(within(nav).queryByRole("button", { name: "West 1" })).not.toBeInTheDocument(),
    )
  })

  it("choosing a child from the rail goes to its parent's map, zoomed in on the child", async () => {
    const { container } = setup()
    const nav = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    fireEvent.click(within(nav()).getByRole("button", { name: "Expand West" }))
    await waitFor(() =>
      expect(within(nav()).getByRole("button", { name: "West 1" })).toBeInTheDocument(),
    )
    fireEvent.click(within(nav()).getByRole("button", { name: "West 1" }))
    // A district is only drawn on its circuit's map, so choosing one moves there — the same
    // journey the reader would make by hand, rather than a selection they cannot see.
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "child",
      ),
    )
    const local = container.querySelector<HTMLElement>('[data-drilldown-layer="local"]')!
    expect(local).toHaveAttribute("data-parent-id", "west")
    // …and what they chose is what greets them there, not the circuit they travelled through
    await waitFor(() => expect(pane(container)).toHaveAttribute("data-open"))
    expect(pane(container).querySelector("[data-drilldown-pane-title]")).toHaveTextContent("West 1")
    await waitFor(() =>
      expect(local.querySelector('path[data-region-id="w1"]')).toHaveAttribute("data-selected"),
    )
    await waitFor(() => expect(window.location.search).toBe("?region=w1&pane=1"))
  })

  it("restores a deep link onto the stage that is actually on screen", async () => {
    window.history.replaceState(null, "", "/interactives/courts?view=west")
    // Under Strict Mode the first stage is destroyed and a second built. Every guard used to
    // ask React state — "we are already at west" — so nobody drilled the new stage, and its
    // districts' seat blocks were drawn over a national map that had never gone away.
    const { container } = setup({ strict: true })
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "child",
      ),
    )
    // The map that is up must be the one the address named, not the overview with the
    // child's blocks scattered over it.
    const local = container.querySelector<HTMLElement>('[data-drilldown-layer="local"]')!
    expect(local).toHaveAttribute("data-parent-id", "west")
    await waitFor(() => expect(local).not.toHaveAttribute("data-state", "hidden"))
    expect(container.querySelector('[data-drilldown-layer="overview"]')).toHaveAttribute(
      "data-state",
      "hidden-hard",
    )
    // Its blocks are the child's, and they are drawn on the child's layer.
    await waitFor(() =>
      expect(
        Array.from(local.querySelectorAll("g[data-drilldown-block]")).map((b) =>
          b.getAttribute("data-region-id"),
        ),
      ).toEqual(["west", "w1", "w2"]),
    )
    expect(
      container.querySelectorAll('[data-drilldown-layer="overview"] g[data-drilldown-block]'),
    ).toHaveLength(0)
  })

  it("says where on the map the reader has got to, and takes them back up it", async () => {
    const { container } = setup()
    const trail = (): HTMLElement => container.querySelector<HTMLElement>("[data-drilldown-trail]")!
    const crumbs = (): string[] =>
      Array.from(
        trail().querySelectorAll("[data-slot='breadcrumb-link'], [data-slot='breadcrumb-page']"),
      ).map((c) => c.textContent?.trim() || c.getAttribute("aria-label") || "")

    // Nowhere yet, so nothing to say: a trail at the overview would be one map icon telling
    // the reader they are where they started.
    expect(container.querySelector("[data-drilldown-trail]")).toBeNull()

    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() => expect(crumbs()).toEqual(["Back to the whole map", "West"]))

    fireEvent.click(selector(container).getByRole("button", { name: "West 1" }))
    await waitFor(() => expect(crumbs()).toEqual(["Back to the whole map", "West", "West 1"]))
    // The end of the trail is where they are; everything before it is a way back.
    expect(trail().querySelector("[data-drilldown-trail-item='west']")).toBeInTheDocument()
    expect(trail().querySelector("[data-drilldown-trail-item='w1']")).toBeNull()

    // Going back up it selects the circuit rather than leaving its map.
    fireEvent.click(trail().querySelector<HTMLElement>("[data-drilldown-trail-item='west']")!)
    await waitFor(() => expect(crumbs()).toEqual(["Back to the whole map", "West"]))
    expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
      "data-view",
      "child",
    )

    // And the map icon is the way out of it entirely.
    fireEvent.click(trail().querySelector<HTMLElement>("[data-drilldown-trail-root]")!)
    await waitFor(() =>
      expect(container.querySelector("[data-drilldown-viewport]")).toHaveAttribute(
        "data-view",
        "overview",
      ),
    )
    expect(container.querySelector("[data-drilldown-trail]")).toBeNull()
  })

  it("keeps the pane inside the map's area, opening it on a region and closing it back", async () => {
    const { container } = setup()
    const sheet = (): HTMLElement => container.querySelector<HTMLElement>("[data-drilldown-sheet]")!
    const toggle = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-pane-toggle]")!
    // The pane stands beside the map, in the same row as the map and the rail, and brings its
    // own header — the one control that names it and opens it.
    expect(sheet().contains(pane(container))).toBe(true)
    expect(pane(container).contains(toggle())).toBe(true)
    const row = container.querySelector("[data-drilldown-viewport]")!.parentElement!
    expect(row.contains(sheet())).toBe(true)
    expect(row.contains(container.querySelector("[data-drilldown-rail]"))).toBe(true)

    // Collapsed on arrival: the map is what a reader came for.
    expect(sheet()).not.toHaveAttribute("data-open")
    expect(toggle()).toHaveAttribute("aria-expanded", "false")

    fireEvent.click(toggle())
    expect(sheet()).toHaveAttribute("data-open")

    fireEvent.click(toggle())
    expect(sheet()).not.toHaveAttribute("data-open")

    // Choosing a region opens it on that region.
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    await waitFor(() => expect(sheet()).toHaveAttribute("data-open"))
    expect(pane(container).querySelector("[data-drilldown-pane-title]")).toHaveTextContent("West")
  })

  it("folds the rail away and hands its width to the map", async () => {
    const { container } = setup()
    const toggle = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-rail-toggle]")!
    const rail = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-rail]")!.parentElement!.parentElement!

    expect(toggle()).toHaveAttribute("aria-expanded", "true")
    expect(toggle()).toHaveAccessibleName("Hide the region list")
    expect(rail()).not.toHaveAttribute("inert")
    // Until the reader says otherwise the default is a question of screen, and it is answered
    // in CSS rather than by a breakpoint read after mount: folded above the map on a phone,
    // open beside it from `md` up. A phone therefore renders it folded rather than animating
    // it shut on arrival.
    expect(rail()).toHaveClass("grid-rows-[0fr]", "md:grid-rows-[1fr]", "md:grid-cols-[1fr]")
    // The toggle says which thing it folds, which is the rail's own wrapper.
    expect(toggle().getAttribute("aria-controls")).toBe(rail().id)

    fireEvent.click(toggle())
    expect(toggle()).toHaveAttribute("aria-expanded", "false")
    expect(toggle()).toHaveAccessibleName("Show the region list")
    // Folded away is out of reach: no tabbing into a rail that is not on screen.
    expect(rail()).toHaveAttribute("inert")

    fireEvent.click(toggle())
    expect(rail()).not.toHaveAttribute("inert")
  })

  it("puts the profile's icon beside a top-level region, and none beside a child", async () => {
    const { container } = setup()
    const nav = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    // `west` is drawn on the circuit layer; `east` is named outright. Both come from the
    // profile through the payload — the engine only knows the names it allows.
    expect(nav().querySelector('[data-region-item="west"] svg')).toHaveClass("lucide-scale")
    expect(nav().querySelector('[data-region-item="east"] svg')).toHaveClass("lucide-landmark")

    fireEvent.click(within(nav()).getByRole("button", { name: "Expand West" }))
    await waitFor(() =>
      expect(within(nav()).getByRole("button", { name: "West 1" })).toBeInTheDocument(),
    )
    expect(nav().querySelector('[data-region-item="w1"] svg')).toBeNull()
  })

  it("opens one branch at a time, so the rail never becomes a wall of districts", async () => {
    const { container, fetchMock } = setup({ eastMap: true })
    const nav = (): HTMLElement =>
      container.querySelector<HTMLElement>("[data-drilldown-selector]")!
    fireEvent.click(within(nav()).getByRole("button", { name: "Expand West" }))
    await waitFor(() =>
      expect(within(nav()).getByRole("button", { name: "West 1" })).toBeInTheDocument(),
    )
    fireEvent.click(within(nav()).getByRole("button", { name: "Expand East" }))
    await waitFor(() =>
      expect(within(nav()).getByRole("button", { name: "East 1" })).toBeInTheDocument(),
    )
    // West's districts go away with it — shrinking while East's grow, so the swap is visible —
    // and the branch left behind is inert the moment it starts closing.
    const branches = (): NodeListOf<HTMLElement> =>
      nav().querySelectorAll("[data-drilldown-branch]")
    // East sorts before West in this fixture, so the branch that just opened comes first.
    expect(Array.from(branches()).map((b) => b.dataset.drilldownBranch)).toEqual([
      "open",
      "closing",
    ])
    await waitFor(() =>
      expect(within(nav()).queryByRole("button", { name: "West 1" })).not.toBeInTheDocument(),
    )
    expect(within(nav()).getByRole("button", { name: "West" })).toHaveAttribute(
      "aria-expanded",
      "false",
    )
    // Two regions, two halves each.
    expect(fetchMock).toHaveBeenCalledTimes(4)
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

  it("leaves the seniors off the timeline too, until asked for them", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    const p = pane(container)
    await within(p).findByRole("button", { name: "Ada Lovelace" })
    fireEvent.click(within(p).getByRole("button", { name: "Timeline" }))

    // The same default the seat chart has: who sits now, not everyone who has sat.
    const hopper = (): HTMLElement => within(p).getByRole("button", { name: "Grace Hopper" })
    expect(within(p).getByRole("button", { name: "Hidden" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    expect(hopper()).toHaveClass("opacity-0")

    // Two options here, not three: a timeline has no seats to take and no majority to count
    // toward, so "Counted" would be a second word for "Shown".
    expect(within(p).queryByRole("button", { name: "Counted" })).not.toBeInTheDocument()
    fireEvent.click(within(p).getByRole("button", { name: "Shown" }))
    expect(hopper()).not.toHaveClass("opacity-0")
  })

  it("seat-chart view counts the authorized bench, and folds the seniors in on request", async () => {
    const { container } = setup()
    fireEvent.click(selector(container).getByRole("button", { name: "West" }))
    const p = pane(container)
    await within(p).findByRole("button", { name: "Ada Lovelace" })
    // seats is the default view, and the seniors start off the chart entirely
    const count = () => p.querySelector("[data-drilldown-count]")!.textContent
    expect(count()).toBe("D-appointed 1 of 2 · majority 2 (no majority)")
    expect(within(p).getByRole("button", { name: "Hidden" })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    // A hidden member stays mounted so it can animate back in; it is off the chart, not gone.
    const hopper = (): HTMLElement => within(p).getByRole("button", { name: "Grace Hopper" })
    expect(hopper()).toHaveClass("opacity-0")
    // alongside puts them in an outer band, still outside the count
    fireEvent.click(within(p).getByRole("button", { name: "Alongside" }))
    expect(count()).toBe("D-appointed 1 of 2 · majority 2 (no majority)")
    expect(hopper()).not.toHaveClass("opacity-0")
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
    expect(within(nav).getByRole("button", { name: "Back to overview" })).toBeInTheDocument()
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

    fireEvent.click(within(nav).getByRole("button", { name: "Back to overview" }))
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
