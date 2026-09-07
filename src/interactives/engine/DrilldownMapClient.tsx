"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
import type { ChildAssetRef, DrilldownAsset, RegionIndex } from "./types"

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

  const [loaded, setLoaded] = useState<Record<string, DrilldownAsset>>({})
  const [loadState, setLoadState] = useState<Record<string, LoadState>>({})
  const [view, setView] = useState<View>({ parentId: null })
  const [selected, setSelected] = useState<string | null>(null)
  const [paneOpen, setPaneOpen] = useState(false)
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [pinRequest, setPinRequest] = useState<(PinRequest & { regionId: string }) | null>(null)
  // The record the reader has pinned in the pane, mirrored here only so the URL can carry it.
  const [pinned, setPinned] = useState<string | null>(null)
  // Which regions show their children in the rail. Drilling in opens one; the reader can open
  // any of them by hand, which is also what fetches the labels their children are named by.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
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
  const urlFor = useCallback(
    (regionId: string) => childAssets.find((a) => a.regionId === regionId)?.url ?? null,
    [childAssets],
  )

  // ---- asset loading -----------------------------------------------------------------------

  const ensureAsset = useCallback(
    async (key: string): Promise<DrilldownAsset | null> => {
      const url = urlFor(key)
      if (!url) return null
      const cached = loader.get(url)
      if (cached) return cached
      setLoadState((s) => ({ ...s, [key]: "loading" }))
      try {
        const asset = await loader.load(url)
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
    [urlFor, loader],
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
          setPaneOpen((open) => force || !open)
          return id
        }
        setPaneOpen(true)
        return id
      })
      const key = assetKeyFor(id, regions, childAssets)
      if (key) void ensureAsset(key)
    },
    [regions, childAssets, ensureAsset],
  )

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
      if (view.parentId === parentId) {
        setPaneOpen(false)
        return
      }
      // Fetch and leave at the same time: every morph is anchored to the overview, so there
      // is no plan that goes from one child map straight to another — crossing between two
      // circuits is a drill out and a drill in, which is the journey a reader would make by
      // hand anyway. Without it the map being left stayed on the stage under the new one.
      const pending = ensureAsset(parentId)
      if (view.parentId !== null && (await drillOut()) === "cancelled") return
      const asset = await pending
      if (!asset || !stageRef.current) {
        // The map could not be fetched, but the reader still asked for this region: open the
        // pane on it anyway, where the error — and the drill button, now a retry — are shown.
        if (via) select(parentId, via)
        return
      }
      if (via) lastVia.current = via
      setExpanded((cur) => (cur.has(parentId) ? cur : new Set(cur).add(parentId)))
      setPaneOpen(via !== null)
      setSelected(via ? parentId : null)
      // The state update carrying this asset has not committed yet; give the stage the merged
      // index now so the child view's blocks are sized from its facts.
      const merged = buildRegionIndex([overview, ...Object.values(loaded), asset])
      stage.setRegions(merged)
      setView({ parentId })
      setBusy(true)
      const how = await stage.drillIn(parentId, asset)
      setBusy(false)
      if (how === "cancelled") return
      // The morph clears the map's own highlight; put it back on the region the reader chose.
      if (via) stage.setSelected(parentId)
      stage.renderBlocks(blockIdsFor({ parentId }, merged, { ...loaded, [parentId]: asset }))
    },
    [view.parentId, ensureAsset, overview, loaded, select, drillOut],
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
        if (drillable.has(id) && view.parentId !== id) {
          await drillIn(id, via)
          return
        }
        const key = assetKeyFor(id, regions, childAssets)
        if (key && key !== id && view.parentId !== key) await drillIn(key)
      } finally {
        moving.current = outer
        if (!outer) setSettled((n) => n + 1)
      }
      select(id, via, opts)
    },
    [regions, childAssets, drillable, view.parentId, drillIn, select],
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

  /** Open or close a region's children in the rail, fetching them the first time. */
  const toggleExpanded = useCallback(
    (id: string) => {
      setExpanded((cur) => {
        const next = new Set(cur)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
      if (!expanded.has(id)) void ensureAsset(id)
    },
    [expanded, ensureAsset],
  )

  // ---- the URL as the map's address ----------------------------------------------------------

  /**
   * Where the reader is, written into the query string: `region` is the one whose pane is
   * open — which is also what says which map is on screen — `view` stands in for it when the
   * reader has closed the pane on a child map, and `record` names the pinned card. Every state
   * a click can reach is therefore a link someone can send, and Back walks the way they came.
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
          if (record) {
            pinNonce.current += 1
            setPinRequest({ regionId: region, recordId: record, nonce: pinNonce.current })
            setPinned(record)
          }
          return
        }
        deselect()
        if (parent && parent !== view.parentId) await drillIn(parent)
        else if (!parent && view.parentId) await drillOut()
      } finally {
        moving.current = false
      }
    },
    [regions, view.parentId, revealRegion, drillIn, drillOut, deselect],
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
    // A selected region already says which map it is on, so `view` is only for a map the
    // reader is standing on with nothing open — never both, they would say the same thing.
    const shown = paneOpen && selected ? selected : null
    set("region", shown)
    set("view", shown ? null : view.parentId)
    set("record", shown ? pinned : null)
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
    if (!busy) stage.renderBlocks(blockIdsFor(view, regions, loaded))
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
      onClose={deselect}
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
        className="flex flex-col gap-3"
      >
        {/* The rail rides beside the map from tablet up, and above it on a phone. */}
        <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-start">
          <DrilldownSelector
            regions={regions}
            view={view}
            selected={selected}
            drillable={drillable}
            expanded={expanded}
            onSelect={(id, via) => void open(id, via)}
            onToggle={toggleExpanded}
            onBack={() => void drillOut()}
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
            className="md:w-56 md:shrink-0 lg:w-64"
          />
          <div
            ref={viewportRef}
            data-drilldown-viewport=""
            data-view={view.parentId ? "child" : "overview"}
            aria-busy={busy || undefined}
            className="bg-muted/30 @container relative min-w-0 flex-1 overflow-hidden rounded-lg"
          >
            {children}
            <div ref={layersRef} data-drilldown-layers="" />
          </div>
        </div>
        {pane}
      </div>
      <DrilldownTooltip
        label={hoverRegion?.label ?? null}
        summary={hoverRegion?.summary ?? null}
        cursor={hover ? { x: hover.x, y: hover.y } : null}
      />
    </DrilldownSelectionProvider>
  )
}
