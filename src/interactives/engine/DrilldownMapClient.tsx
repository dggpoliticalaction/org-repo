"use client"

import { MapIcon, PanelLeft, PanelRight } from "lucide-react"
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/utilities/utils"
import { Separator } from "@/components/ui/separator"

import { AssetLoader } from "./assetLoader"
import { DrilldownPane, type DrilldownPaneHandle, type PinRequest } from "./DrilldownPane"
import { DrilldownSearch } from "./DrilldownSearch"
import { DrilldownSelector, type SelectVia } from "./DrilldownSelector"
import { DrilldownTooltip } from "./DrilldownTooltip"
import { DEFAULT_VIEWBOX } from "./geometry"
import { assetKeyFor, recordsFor } from "./records"
import { buildRegionIndex, displayFacts } from "./regions"
import type { SearchResult } from "./search"
import { DrilldownSelectionProvider } from "./selection"
import { MapStage } from "./stage"
import type { ChildAssetRef, DrilldownAsset, RegionIndex, RegionInfo } from "./types"

export interface DrilldownMapClientProps {
  /** The overview asset with path data stripped — geometry lives in the server-rendered SVG. */
  overview: DrilldownAsset
  childAssets: ChildAssetRef[]
  /** Empty-state text for the pane. */
  emptyHint?: string
  /**
   * Turns on record search. `url` serves the index (`DrilldownSearch`); `label` names it in
   * the interactive's own vocabulary ("Search judges"). Omitted, no search box is rendered.
   */
  search?: { url: string; label?: string }
  /**
   * Shown in the pane before a region is chosen: an overview of the whole dataset. Reaches the
   * map's selection through `useDrilldownSelection`, so a reader can go from it to a region.
   */
  summary?: React.ReactNode
  /** The server-rendered overview layer. */
  children: React.ReactNode
}

interface View {
  parentId: string | null
}
type LoadState = "loading" | "error"

function blockIdsFor(
  view: View,
  regions: RegionIndex,
  loaded: Record<string, DrilldownAsset>,
): string[] {
  if (!view.parentId) return regions.topLevel
  const children = regions.childrenOf[view.parentId] ?? []
  const asset = loaded[view.parentId]
  const hasGeometry = asset ? asset.paths.some((p) => p.id) : false
  // The parent leads its own children: on its own map its block sits in the gutter beside it,
  // so the bench that hears the whole region is where the region is.
  // A parent with no child geometry keeps the overview on screen instead: its children join
  // the top-level blocks at their declared anchors.
  return hasGeometry ? [view.parentId, ...children] : [...regions.topLevel, ...children]
}

export function DrilldownMapClient({
  overview,
  childAssets,
  emptyHint,
  search,
  summary,
  children,
}: DrilldownMapClientProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const layersRef = useRef<HTMLDivElement | null>(null)
  const stageRef = useRef<MapStage | null>(null)
  const paneRef = useRef<DrilldownPaneHandle | null>(null)
  const [loader] = useState(() => new AssetLoader())
  // Whether the reader has said anything about the rail. Null until they do, and the default
  // is then a question of screen: beside the map there is room for it, above the map on a
  // phone it costs a third of the first screenful, so it starts folded and the same button
  // unfolds it. The default lives in CSS rather than in a breakpoint read after mount, so a
  // phone renders the folded state outright instead of animating shut on arrival.
  const [railChoice, setRailChoice] = useState<boolean | null>(null)
  const isMobile = useIsMobile()
  const railOpen = railChoice ?? !isMobile
  const railId = useId()

  const paneId = useId()

  const [loaded, setLoaded] = useState<Record<string, DrilldownAsset>>({})
  const [loadState, setLoadState] = useState<Record<string, LoadState>>({})
  const [view, setView] = useState<View>({ parentId: null })
  const [selected, setSelected] = useState<string | null>(null)
  // Closed on arrival: the map is what a reader came for, and the bar says the overview is
  // there to be opened. Choosing a region opens it.
  const [paneOpen, setPaneOpen] = useState(false)
  /**
   * One panel at a time. The rail is for choosing where to go and the pane is for reading
   * what is there, and on the widths this runs at, both of them open leave a map too narrow
   * to be the thing they are about. Opening either therefore folds the other.
   */
  const showRail = useCallback((open: boolean) => {
    setRailChoice(open)
    if (open) setPaneOpen(false)
  }, [])
  const showPane = useCallback((open: boolean) => {
    setPaneOpen(open)
    if (open) setRailChoice(false)
  }, [])
  /**
   * The folded rail's search glyph. A search box needs a rail's width, so the glyph stands for
   * one: it unfolds the rail and puts the reader where they were going, rather than making
   * them open the rail and then find the box themselves.
   */
  const unfoldToSearch = useCallback(() => {
    showRail(true)
    // The box is only mounted once the rail is open, so it cannot be focused until after that
    // render has happened.
    requestAnimationFrame(() => {
      document
        .getElementById(railId)
        ?.querySelector<HTMLInputElement>("[data-drilldown-search] input")
        ?.focus()
    })
  }, [showRail, railId])

  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [pinRequest, setPinRequest] = useState<(PinRequest & { regionId: string }) | null>(null)
  // The record the reader has pinned in the pane, mirrored here only so the URL can carry it.
  const [pinned, setPinned] = useState<string | null>(null)
  // The one region showing its children in the rail. One at a time: a reader comparing two
  // circuits is comparing the maps, not two lists of district names, and 94 districts open at
  // once turn the rail into a scroll with no landmarks. Drilling in opens that region's
  // branch, which is also what fetches the labels its children are named by.
  const [expanded, setExpanded] = useState<string | null>(null)
  // How the last selection was made, so keyboard users land in the pane they just opened.
  const lastVia = useRef<SelectVia>("pointer")
  // Set while the reader is between places — a move in flight, or the address being read back.
  // The address records where they land, never the steps taken to get there: reaching a
  // district is one click and must be one entry to go back from, not a stop on its parent's
  // map that nobody asked to stand on. `settled` is bumped when a move ends, because the
  // states a move passes through are the ones that would otherwise have written it.
  const moving = useRef(false)
  const [settled, setSettled] = useState(0)

  const regions = useMemo(
    () => buildRegionIndex([overview, ...Object.values(loaded)]),
    [overview, loaded],
  )
  const drillable = useMemo(() => new Set(childAssets.map((a) => a.regionId)), [childAssets])
  const refFor = useCallback(
    (regionId: string) => childAssets.find((a) => a.regionId === regionId) ?? null,
    [childAssets],
  )

  // ---- asset loading -----------------------------------------------------------------------

  const ensureAsset = useCallback(
    async (key: string): Promise<DrilldownAsset | null> => {
      const ref = refFor(key)
      if (!ref) return null
      const cached = loader.get(ref.url)
      if (cached) return cached
      setLoadState((s) => ({ ...s, [key]: "loading" }))
      try {
        const asset = await loader.load(ref.url, ref.geometryUrl)
        setLoaded((prev) => (prev[key] === asset ? prev : { ...prev, [key]: asset }))
        setLoadState((s) => {
          const { [key]: _omit, ...rest } = s
          return rest
        })
        return asset
      } catch (err) {
        console.error(`[interactive-map] failed to load region asset for "${key}":`, err)
        setLoadState((s) => ({ ...s, [key]: "error" }))
        return null
      }
    },
    [refFor, loader],
  )

  // ---- selection / navigation -------------------------------------------------------------

  const focusSelectorItem = useCallback((id: string | null) => {
    if (!id || !rootRef.current) return
    const items = rootRef.current.querySelectorAll<HTMLButtonElement>(
      "[data-drilldown-selector] button[data-region-item]",
    )
    for (const item of items) if (item.dataset.regionItem === id) return item.focus()
  }, [])

  const deselect = useCallback(() => {
    setSelected((cur) => {
      // Hand focus back to where the selection is made from, so Escape/× do not drop it.
      if (cur && rootRef.current?.contains(document.activeElement)) focusSelectorItem(cur)
      return null
    })
    setPinned(null)
    setPaneOpen(false)
  }, [focusSelectorItem])

  const select = useCallback(
    (id: string, via: SelectVia = "pointer", { force = false }: { force?: boolean } = {}) => {
      if (!regions.byId[id]) return
      lastVia.current = via
      // A pin belongs to the region it was made for; selecting elsewhere drops it.
      setPinRequest((cur) => (cur && cur.regionId !== id ? null : cur))
      setPinned(null)
      setSelected((cur) => {
        if (cur === id) {
          // `force` is for a selection that is showing something specific (a search result):
          // re-selecting the region it is already on must not toggle the pane shut.
          setPaneOpen((open) => {
            const next = force || !open
            if (next) setRailChoice(false)
            return next
          })
          return id
        }
        showPane(true)
        return id
      })
      const key = assetKeyFor(id, regions, childAssets)
      if (key) void ensureAsset(key)
    },
    [regions, childAssets, ensureAsset, showPane],
  )

  /**
   * Which map the stage is actually showing.
   *
   * React state can say more than the stage knows. A stage is built once per overview asset —
   * and twice on mount in development, where Strict Mode runs the effect, tears it down and
   * runs it again — and a new one starts at the overview however far the reader had already
   * drilled. Asking state instead of the stage is how a deep link ended up with the child's
   * seat blocks scattered across the national map: every guard said "we are already at ca9",
   * so nobody told the rebuilt stage.
   */
  const shownParent = useCallback((): string | null => stageRef.current?.currentParent ?? null, [])

  const drillOut = useCallback(async (): Promise<"done" | "fallback" | "cancelled"> => {
    const stage = stageRef.current
    if (!stage) return "cancelled"
    setPaneOpen(false)
    setSelected(null)
    setPinned(null)
    setView({ parentId: null })
    setBusy(true)
    const how = await stage.drillOut()
    setBusy(false)
    if (how === "cancelled") return how
    stage.renderBlocks(regions.topLevel)
    return how
  }, [regions.topLevel])

  /**
   * Move into a region's own map. `via` is set when the reader asked for the *region* and not
   * merely for its map — clicking a circuit — and then it stays selected through the morph, so
   * the pane that greets them on arrival is the circuit's own bench.
   */
  const drillIn = useCallback(
    async (parentId: string, via: SelectVia | null = null) => {
      const stage = stageRef.current
      if (!stage) return
      if (view.parentId === parentId && shownParent() === parentId) {
        setPaneOpen(false)
        return
      }
      // Crossing from one child map to another is one movement, not a drill out followed by a
      // drill in: the stage flies the camera through the overview rather than stopping there
      // (`crossTo`). The asset is fetched first, because there is nothing to cross to until
      // it has arrived.
      const crossing = shownParent() !== null && shownParent() !== parentId
      const asset = await ensureAsset(parentId)
      if (!asset || !stageRef.current) {
        // The map could not be fetched, but the reader still asked for this region: open the
        // pane on it anyway, where the error — and the drill button, now a retry — are shown.
        if (via) select(parentId, via)
        return
      }
      if (via) lastVia.current = via
      setExpanded(parentId)
      showPane(via !== null)
      setSelected(via ? parentId : null)
      // The state update carrying this asset has not committed yet; give the stage the merged
      // index now so the child view's blocks are sized from its facts.
      const merged = buildRegionIndex([overview, ...Object.values(loaded), asset])
      stage.setRegions(merged)
      setView({ parentId })
      setBusy(true)
      const how = crossing
        ? await stage.crossTo(parentId, asset)
        : await stage.drillIn(parentId, asset)
      setBusy(false)
      if (how === "cancelled") return
      // The morph clears the map's own highlight; put it back on the region the reader chose.
      if (via) stage.setSelected(parentId)
      stage.renderBlocks(blockIdsFor({ parentId }, merged, { ...loaded, [parentId]: asset }))
    },
    [view.parentId, shownParent, ensureAsset, overview, loaded, select, showPane],
  )

  /**
   * What choosing a region means, wherever it is chosen from. A region with a map of its own
   * opens it — one click moves in rather than selecting now and drilling as a second step —
   * and a region that lives on a map the reader is not standing on is reached by moving to
   * that map first: choosing a district from the rail lands on its circuit, zoomed in, the
   * same as choosing the circuit does. Anything already on screen simply selects.
   */
  const open = useCallback(
    async (id: string, via: SelectVia = "pointer", opts?: { force?: boolean }): Promise<void> => {
      if (!regions.byId[id]) return
      // The whole move is one journey. Each morph along the way settles into a state of its
      // own, and writing those would put a map the reader only passed through into their
      // history — so the address is written once, from where the journey ends. A move made
      // to satisfy an address already being read back writes nothing at all.
      const outer = moving.current
      moving.current = true
      try {
        if (drillable.has(id) && shownParent() !== id) {
          await drillIn(id, via)
          return
        }
        const key = assetKeyFor(id, regions, childAssets)
        if (key && key !== id && shownParent() !== key) await drillIn(key)
      } finally {
        moving.current = outer
        if (!outer) setSettled((n) => n + 1)
      }
      select(id, via, opts)
    },
    [regions, childAssets, drillable, shownParent, drillIn, select],
  )

  // A search result names a record, not a region: show the map the record sits on, select its
  // region and ask the pane to pin it. The pane does the pinning once the region's asset has
  // arrived, so a result in a region that is not loaded yet still lands on the right card.
  const pinNonce = useRef(0)

  /** Show the map the region sits on, then select it. Returns false for an unknown region. */
  const revealRegion = useCallback(
    async (regionId: string): Promise<boolean> => {
      if (!regions.byId[regionId]) return false
      await open(regionId, "keyboard", { force: true })
      return true
    },
    [regions, open],
  )

  const revealRecord = useCallback(
    async (result: SearchResult) => {
      if (!(await revealRegion(result.region))) return
      pinNonce.current += 1
      // The selection above is what clears a pin left on another region, so pin after it.
      setPinRequest({ regionId: result.region, recordId: result.id, nonce: pinNonce.current })
    },
    [revealRegion],
  )

  /** Open a region's children in the rail — closing whichever was open — or close its own. */
  const toggleExpanded = useCallback(
    (id: string) => {
      setExpanded((cur) => (cur === id ? null : id))
      if (expanded !== id) void ensureAsset(id)
    },
    [expanded, ensureAsset],
  )

  // ---- the URL as the map's address ----------------------------------------------------------

  /**
   * Where the reader is, written into the query string: `region` is the one selected — which
   * is also what says which map is on screen — `view` stands in for it when the
   * reader is standing on with nothing selected, `pane` says whether the pane is open, and
   * `record` names the pinned card. Every state a click can reach is therefore a link
   * someone can send, and Back walks the way they came.
   *
   * The history entries are written by hand rather than through the router: this is the same
   * document either way, and a router navigation would re-run the page's own data fetch to
   * land on markup identical to what is already on screen.
   */
  /** Nothing is written until the address has been read, or the read would erase itself. */
  const restored = useRef(false)
  /** A restored address is canonicalised in place: arriving somewhere is not a step taken. */
  const arrived = useRef(false)

  const applyUrl = useCallback(
    async (query: string) => {
      const q = new URLSearchParams(query)
      const region = q.get("region")
      const parent = q.get("view")
      const record = q.get("record")
      moving.current = true
      try {
        if (region && regions.byId[region]) {
          await revealRegion(region)
          // The address is what says whether the pane is open; revealing a region opens it,
          // which is only right if the address agrees. A pinned record says so too — the card
          // it names lives in the pane, so naming one and closing the pane is a contradiction.
          showPane(q.get("pane") === "1" || !!record)
          if (record) {
            pinNonce.current += 1
            setPinRequest({ regionId: region, recordId: record, nonce: pinNonce.current })
            setPinned(record)
          }
          return
        }
        deselect()
        // Against the stage, not against state: on a remount the address has already been
        // applied to a stage that no longer exists.
        if (parent && parent !== shownParent()) await drillIn(parent)
        else if (!parent && shownParent()) await drillOut()
        // Only when the address asks for it. A bare arrival names nothing, and asserting
        // the other way there would re-close the pane a moment after load, over a reader who
        // had just opened it.
        if (q.get("pane") === "1") showPane(true)
      } finally {
        moving.current = false
      }
    },
    [regions, shownParent, revealRegion, drillIn, drillOut, deselect, showPane],
  )

  // Read the address once on mount, and again whenever the reader moves through history.
  const applyUrlRef = useRef(applyUrl)
  useEffect(() => {
    applyUrlRef.current = applyUrl
  }, [applyUrl])
  useEffect(() => {
    const onPop = (): void => void applyUrlRef.current(window.location.search)
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  useEffect(() => {
    if (!restored.current || moving.current) return
    const q = new URLSearchParams(window.location.search)
    const before = q.toString()
    const set = (key: string, value: string | null): void => {
      if (value) q.set(key, value)
      else q.delete(key)
    }
    // Two questions, two keys. Where the reader is: a selected region, which already says
    // which map it is on, or else the map they are standing on — never both, they would say
    // the same thing. And whether the pane is open, which used to be implied by *which* of
    // those keys was written, so closing the pane on a circuit turned `region` into `view`
    // and the address looked like the reader had gone somewhere.
    set("region", selected)
    set("view", selected ? null : view.parentId)
    set("pane", paneOpen ? "1" : null)
    set("record", selected && paneOpen ? pinned : null)
    const after = q.toString()
    if (after === before) return
    // Moving the map or the pane is a step worth going back from; re-pinning a card is not,
    // and nor is tidying the address the reader arrived on.
    const step =
      !arrived.current &&
      (new URLSearchParams(before).get("view") !== q.get("view") ||
        new URLSearchParams(before).get("region") !== q.get("region"))
    arrived.current = false
    const url = `${window.location.pathname}${after ? `?${after}` : ""}${window.location.hash}`
    window.history[step ? "pushState" : "replaceState"](null, "", url)
  }, [view.parentId, selected, paneOpen, pinned, settled])

  // ---- stage lifecycle ---------------------------------------------------------------------

  // The stage is created once; it calls back into whichever `open` is current.
  const selectRef = useRef(open)
  useEffect(() => {
    selectRef.current = open
  }, [open])

  useEffect(() => {
    const viewport = viewportRef.current
    const layersHost = layersRef.current
    const overviewLayer = viewport?.querySelector<HTMLElement>('[data-drilldown-layer="overview"]')
    if (!viewport || !layersHost || !overviewLayer) return
    let stage: MapStage
    try {
      stage = new MapStage({
        viewport,
        overviewLayer,
        layersHost,
        overviewViewBox: overview.viewBox ?? DEFAULT_VIEWBOX,
        flipY: overview.flipY,
        regions: buildRegionIndex([overview]),
        seats: overview.payload?.seats ?? null,
        callbacks: {
          onHover: (id, point) => setHover(id && point ? { id, x: point.x, y: point.y } : null),
          onSelect: (id, via) => void selectRef.current(id, via),
        },
      })
    } catch (err) {
      console.error("[interactive-map] drilldown stage failed to mount:", err)
      return
    }
    stageRef.current = stage
    stage.renderBlocks(buildRegionIndex([overview]).topLevel)
    // Only now can a drill run, so this is where a deep link is honoured.
    void applyUrlRef.current(window.location.search).finally(() => {
      restored.current = true
      arrived.current = true
    })
    return () => {
      stage.destroy()
      if (stageRef.current === stage) stageRef.current = null
    }
  }, [overview])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    stage.setRegions(regions)
    // Blocks are drawn into whichever layer the stage has up, so the set of them has to be
    // chosen from the same place. Taken from `view` instead, a stage that did not reach the
    // map state believes it is on ends up with a child's seat blocks scattered across the
    // overview, each one drawn at an anchor measured for a map that is not on screen.
    if (!busy) stage.renderBlocks(blockIdsFor({ parentId: stage.currentParent }, regions, loaded))
  }, [regions, view, loaded, busy])

  useEffect(() => {
    stageRef.current?.setSelected(selected)
  }, [selected])

  // A keyboard selection moves focus into the pane it opened, because a keyboard reader has
  // no other way to get there. A pointer selection moves nothing: the reader picked a region
  // on the map and the map is what they are looking at — scrolling the pane up under them
  // took the map away as the reward for using it.
  useEffect(() => {
    if (!selected || !paneOpen) return
    if (lastVia.current === "keyboard") paneRef.current?.focusHeading()
  }, [selected, paneOpen])

  // Escape closes an open pane from anywhere on the page — a reader who has scrolled into the
  // bench should not have to find the map first.
  useEffect(() => {
    if (!paneOpen) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") deselect()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [paneOpen, deselect])

  // Escape with nothing selected steps back out of a child view, but only while focus is
  // inside the map: elsewhere on the page that key belongs to whatever the reader is using.
  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key !== "Escape" || paneOpen || !view.parentId) return
    e.preventDefault()
    void drillOut()
  }

  // ---- derived view model ------------------------------------------------------------------

  const selectedRegion = selected ? (regions.byId[selected] ?? null) : null
  const selectedKey = selected ? assetKeyFor(selected, regions, childAssets) : null
  const selectedAsset = selectedKey ? (loaded[selectedKey] ?? null) : null
  const recordsState: "idle" | "loading" | "error" =
    selectedKey && loadState[selectedKey] ? loadState[selectedKey]! : "idle"
  const records = useMemo(
    () =>
      selected
        ? recordsFor(selected, overview, selectedAsset)
        : { seats: [], display: null, associates: [] },
    [selected, overview, selectedAsset],
  )
  const payloadFor = (regionId: string | null) => {
    const key = regionId ? assetKeyFor(regionId, regions, childAssets) : null
    const asset = key ? loaded[key] : undefined
    return asset?.payload?.facts || asset?.payload?.seats ? asset.payload : overview.payload
  }
  const hoverRegion = hover ? (regions.byId[hover.id] ?? null) : null
  /**
   * Where the reader is, from the whole map down. The end of it is the deepest thing they
   * have chosen — the region whose pane is open, or else the map they are standing on — and
   * its ancestors are the way back. The overview is the icon at the head, so a reader who has
   * gone nowhere still sees what "nowhere" is.
   */
  const trail = useMemo(() => {
    const path: RegionInfo[] = []
    const seen = new Set<string>()
    let cur: string | null = ((paneOpen && selected) || view.parentId) ?? null
    while (cur && !seen.has(cur)) {
      seen.add(cur)
      const region = regions.byId[cur]
      if (region) path.unshift(region)
      cur = region?.parentId ?? null
    }
    return path
  }, [paneOpen, selected, view.parentId, regions])
  const canDrill =
    !!selectedRegion &&
    view.parentId !== selectedRegion.id &&
    (drillable.has(selectedRegion.id) || (regions.childrenOf[selectedRegion.id]?.length ?? 0) > 0)

  const pane = (
    <DrilldownPane
      ref={paneRef}
      emptyHint={emptyHint}
      summary={summary}
      pinRequest={pinRequest && pinRequest.regionId === selected ? pinRequest : null}
      onPin={setPinned}
      region={selectedRegion}
      facts={selectedRegion ? displayFacts(selectedRegion, payloadFor(selectedRegion.id)) : []}
      lookups={overview.payload?.lookups}
      records={records}
      recordsState={recordsState}
      open={paneOpen}
      canDrill={canDrill}
      onDrill={() => selectedRegion && void drillIn(selectedRegion.id)}
      onToggle={() => showPane(!paneOpen)}
    />
  )

  const selection = useMemo(
    () => ({ selected, select: (id: string) => void revealRegion(id) }),
    [selected, revealRegion],
  )

  return (
    <DrilldownSelectionProvider value={selection}>
      <div
        ref={rootRef}
        data-drilldown-map=""
        onKeyDown={onKeyDown}
        // The stage's height, which the map letterboxes inside and the rail is capped to, so
        // a wide screen gets a wide map rather than a tall one. One value, declared where
        // both of them can read it.
        className="flex flex-col gap-3 [--drilldown-stage-h:clamp(18rem,78vw,26rem)] md:[--drilldown-stage-h:clamp(26rem,70vh,42rem)]"
      >
        {/* The rail rides beside the map from tablet up, and above it on a phone. */}
        <div className="flex min-w-0 flex-col gap-1 md:flex-row md:items-start">
          {/* Collapsing the rail hands most of its width to the map and keeps a column of
              glyphs, so changing circuit stays one press rather than three — open, choose, and
              the rail folding itself away again behind the summary. It used to fold to nothing
              because thirteen identical scales say nothing; a circuit drawn as its own numeral
              does. Above the map there is no narrow column to keep, so there it still folds
              away along its height — `0fr → 1fr`, the same trick the branches use. */}
          <div
            id={railId}
            // Folded is not hidden on a wide screen: the glyphs are the point of folding.
            inert={(!railOpen && isMobile) || undefined}
            className={cn(
              "grid motion-safe:transition-[grid-template-rows,width] motion-safe:duration-200 motion-safe:ease-out",
              "grid-cols-[1fr]",
              railChoice === null
                ? "grid-rows-[0fr] md:w-56 md:grid-rows-[1fr] lg:w-64"
                : railChoice
                  ? "grid-rows-[1fr] md:w-56 lg:w-64"
                  : "grid-rows-[0fr] md:w-11 md:grid-rows-[1fr]",
            )}
          >
            {/* The clip is the rail's exact box, so anything drawn outside it — a focus
                ring, a shadow — was cut off at the edge. Padding gives it room and the
                the column's own width carries it. Beside the map it applies either way, so a
                glyph sits the same distance from the edge open or folded and the column
                narrowing is the only movement. A negative margin would hide the padding from
                the layout instead, and the rail would then spill past its column on both
                sides and scroll the page sideways. Above the map, where folding still goes to no
                height at all, only while open: `overflow: hidden` clips at the padding box, so
                a folded rail would show four pixels of itself — enough for the selected row's
                dark pill to sit on the edge of the map like a tab. */}
            <div className={cn("min-h-0 min-w-0 overflow-hidden md:p-1", railOpen && "p-1")}>
              <DrilldownSelector
                regions={regions}
                view={view}
                selected={selected}
                drillable={drillable}
                expanded={expanded}
                onSelect={(id, via) => void open(id, via)}
                onToggle={toggleExpanded}
                onBack={() => void drillOut()}
                icons={overview.payload?.icons}
                search={
                  search && (
                    <DrilldownSearch
                      url={search.url}
                      label={search.label}
                      regions={regions}
                      onSelect={(r) => void revealRecord(r)}
                    />
                  )
                }
                collapsed={!railOpen}
                onSearch={search ? unfoldToSearch : undefined}
                className="w-full"
              />
            </div>
          </div>
          <div
            ref={viewportRef}
            data-drilldown-viewport=""
            data-view={view.parentId ? "child" : "overview"}
            aria-busy={busy || undefined}
            className={cn(
              // The map keeps its whole height and gives up width instead: the pane beside it
              // takes what it needs, and what is left is still a map. Underneath, the pane's
              // height always cost the map more than it could spare.
              // `flex-1` only from `md`, where the row is what it flexes inside and the flex
              // is about width. On a phone the row is a column, and a basis of zero there is
              // a map of no height at all.
              "bg-muted/30 @container relative h-(--drilldown-stage-h) min-w-0 overflow-hidden rounded-lg md:flex-1",
              // The hover outline already follows keyboard focus (stage.ts); this is the ring
              // on the map itself, so a reader can tell the map has focus at all.
              "has-[path[tabindex]:focus-visible]:outline-ring has-[path[tabindex]:focus-visible]:outline-2 has-[path[tabindex]:focus-visible]:outline-offset-2",
            )}
          >
            <div className="absolute top-1 left-2 z-10 flex max-w-[calc(100%-1rem)] items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                data-drilldown-rail-toggle=""
                aria-expanded={railOpen}
                aria-controls={railId}
                aria-label={railOpen ? "Hide the region list" : "Show the region list"}
                onClick={() => showRail(!railOpen)}
                className="shrink-0"
              >
                <PanelLeft aria-hidden="true" />
              </Button>
              {trail.length > 0 && (
                <>
                  <Separator orientation="vertical" className="mr-2" />
                  <Breadcrumb
                    data-drilldown-trail=""
                    aria-label="Where you are on the map"
                    className="min-w-0"
                  >
                    <BreadcrumbList className="flex-nowrap gap-1 sm:gap-1.5">
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          render={
                            <button
                              type="button"
                              data-drilldown-trail-root=""
                              aria-label="Back to the whole map"
                              onClick={() => {
                                void drillOut()
                                // Back to the whole map is back to choosing, so the rail that
                                // does the choosing comes back with it.
                                showRail(true)
                              }}
                              className="flex items-center"
                            />
                          }
                        >
                          <MapIcon aria-hidden="true" className="size-4" />
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {trail.map((region, i) => (
                        <React.Fragment key={region.id}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem className="min-w-0">
                            {i === trail.length - 1 ? (
                              <BreadcrumbPage className="truncate" title={region.label}>
                                {region.label}
                              </BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink
                                title={region.label}
                                render={
                                  <button
                                    type="button"
                                    data-drilldown-trail-item={region.id}
                                    onClick={() => void open(region.id, "keyboard")}
                                    className="max-w-40 truncate"
                                  />
                                }
                              >
                                {region.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </React.Fragment>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              data-drilldown-pane-toggle-map=""
              aria-expanded={paneOpen}
              aria-controls={paneId}
              aria-label={paneOpen ? "Hide the details" : "Show the details"}
              onClick={() => showPane(!paneOpen)}
              className="absolute top-1 right-2 z-10"
            >
              <PanelRight aria-hidden="true" />
            </Button>
            {children}
            <div ref={layersRef} data-drilldown-layers="" />
          </div>
          {/* Beside the map, not beneath it. Its height is whatever it needs, and underneath
              that always cost the map more than it could spare — so it folds along its width
              here, and along its height on a phone, where beneath is the only place for it. */}
          <div
            id={paneId}
            inert={!paneOpen || undefined}
            className={cn(
              "grid min-w-0 motion-safe:transition-[grid-template-columns,grid-template-rows] motion-safe:duration-200 motion-safe:ease-out",
              paneOpen
                ? "grid-cols-[1fr] grid-rows-[1fr]"
                : "grid-cols-[1fr] grid-rows-[0fr] md:grid-cols-[0fr] md:grid-rows-[1fr]",
            )}
          >
            {/* Room for a ring while it is open; none when it is folded, or four pixels of
                the pane's own border would show against the map. */}
            <div className={cn("min-h-0 min-w-0 overflow-hidden", paneOpen && "-m-1 p-1")}>
              <div
                data-drilldown-sheet=""
                data-open={paneOpen ? "" : undefined}
                className="bg-card border-border flex min-h-0 flex-col rounded-lg border md:h-(--drilldown-stage-h) md:w-88 lg:w-96"
              >
                {pane}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DrilldownTooltip
        label={hoverRegion?.label ?? null}
        summary={hoverRegion?.summary ?? null}
        cursor={hover ? { x: hover.x, y: hover.y } : null}
      />
    </DrilldownSelectionProvider>
  )
}
