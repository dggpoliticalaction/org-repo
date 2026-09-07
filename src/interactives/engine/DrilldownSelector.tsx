"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from "@/utilities/utils"

import type { RegionIndex } from "./types"

export type SelectVia = "pointer" | "keyboard"

interface DrilldownSelectorProps {
  regions: RegionIndex
  view: { parentId: string | null }
  selected: string | null
  drillable: Set<string>
  /** The one region showing its children, if any: the rail opens a single branch at a time. */
  expanded: string | null
  onSelect(regionId: string, via: SelectVia): void
  onToggle(regionId: string): void
  onBack(): void
  /** Record search, if the interactive has it: rides at the top of the rail, in its width. */
  search?: React.ReactNode
  className?: string
}

const viaOf = (e: React.MouseEvent): SelectVia => (e.detail === 0 ? "keyboard" : "pointer")

/**
 * The chosen region, as an inversion of the rail's own two colours.
 *
 * Not the default active tint, which is the same wash as hover and vanished down a column of
 * a hundred rows. Not `sidebar-primary` either: in this theme that token is a blue, and blue
 * on this page means a Democratic appointee — a selection must not read as a party.
 */
const ACTIVE_ROW =
  "data-active:bg-sidebar-foreground data-active:text-sidebar data-active:hover:bg-sidebar-foreground data-active:hover:text-sidebar"

/**
 * Both a region and its children are `button`s carrying `data-region-item`: the map, the
 * keyboard walk and the tests all find a row by that one attribute, whichever depth it sits at.
 */
const rowProps = (
  regionId: string,
  { label, selected, tabbable }: { label: string; selected: boolean; tabbable: boolean },
) => ({
  type: "button" as const,
  "data-region-item": regionId,
  "aria-pressed": selected,
  tabIndex: tabbable ? 0 : -1,
  // Court names run to "District of the Northern Mariana Islands"; the rail is sized for most
  // of them and this is how a reader gets the rest.
  title: label,
})

/** Long enough to read as a movement, short enough not to be waited on. */
const BRANCH_MS = 220

/**
 * A branch that grows and shrinks rather than appearing and vanishing.
 *
 * The point is the swap: when a reader opens a second circuit, the first one's districts
 * shrink away while the new ones grow in, so it is visible where the list that just arrived
 * came from. Both are therefore on screen together, which is why a closing branch stays
 * mounted until its transition is over.
 *
 * `grid-template-rows: 0fr → 1fr` is what animates to a height nobody has measured. A branch
 * that mounts already open — every first open, since its children arrive with the fetch —
 * would have nothing to animate from, so the first frame is spent closed.
 */
function Branch({ open, children }: { open: boolean; children: React.ReactNode }): React.ReactNode {
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setGrown(open))
    return () => cancelAnimationFrame(frame)
  }, [open])
  return (
    <div
      data-drilldown-branch={open ? "open" : "closing"}
      // Not focusable, not clickable, not in the accessibility tree: a branch on its way out
      // is a picture of where the reader has been, not somewhere they can go.
      inert={!open || undefined}
      className={cn(
        // Duration and easing sit inside the guard with the property: `transition-property`
        // defaults to `all`, so a bare `duration-200` animates everything — including this
        // height — for a reader who asked for no motion.
        "grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200 motion-safe:ease-out",
        grown && open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

/**
 * The region rail: every top-level region down the left of the stage, each drillable one
 * opening to show its own children in place. A tree rather than a strip that swaps its
 * contents, so the reader can see where a district sits without first having to go there.
 *
 * Built on the sidebar primitives (`components/ui/sidebar`), which is what a menu of nested
 * rows with a secondary action on each is in this design system — `collapsible="none"`,
 * because this is a column beside a map rather than an app shell that folds away. The
 * provider is still required: a menu button reads the sidebar's state whether or not anything
 * ever collapses.
 *
 * One tab stop: the selected item (or the first) is tabbable and the arrow keys move focus
 * through the visible rows, so a keyboard reader crosses 94 districts with one Tab, not 94.
 * Right/Left open and close a region, as in any tree.
 */
export function DrilldownSelector({
  regions,
  view,
  selected,
  drillable,
  expanded,
  onSelect,
  onToggle,
  onBack,
  search,
  className,
}: DrilldownSelectorProps): React.ReactElement {
  const navRef = useRef<HTMLDivElement | null>(null)
  // The branch that was open when this one was chosen, kept mounted while it shrinks away.
  // Adjusted during render rather than in an effect, so the two never disagree for a frame.
  const [previous, setPrevious] = useState(expanded)
  const [leaving, setLeaving] = useState<string | null>(null)
  if (previous !== expanded) {
    setPrevious(expanded)
    setLeaving(previous)
  }
  useEffect(() => {
    if (leaving === null) return
    const done = setTimeout(() => setLeaving(null), BRANCH_MS)
    return () => clearTimeout(done)
  }, [leaving])

  const childrenOf = (id: string): string[] => regions.childrenOf[id] ?? []
  const isExpandable = (id: string): boolean => drillable.has(id) || childrenOf(id).length > 0
  const visible: string[] = []
  for (const id of regions.topLevel) {
    visible.push(id)
    if (expanded === id) visible.push(...childrenOf(id))
  }
  const activeId = selected && visible.includes(selected) ? selected : visible[0]

  const onKeyDown = (e: React.KeyboardEvent): void => {
    const nav = navRef.current
    if (!nav) return
    const items = Array.from(nav.querySelectorAll<HTMLButtonElement>("button[data-region-item]"))
    const idx = items.indexOf(document.activeElement as HTMLButtonElement)
    if (idx < 0) return
    const id = items[idx]?.dataset.regionItem ?? ""
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      if (!isExpandable(id) || (expanded === id) === (e.key === "ArrowRight")) return
      e.preventDefault()
      onToggle(id)
      return
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return
    e.preventDefault()
    const next =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? items.length - 1
          : e.key === "ArrowDown"
            ? (idx + 1) % items.length
            : (idx - 1 + items.length) % items.length
    items[next]?.focus()
  }

  return (
    // The rail is two parts: a header that stays put, and the region list that scrolls under
    // it. The list is the scrolling element rather than the page, so the search box needs no
    // `sticky` to hold its place — and sitting outside that scroll box is what keeps its
    // results from being clipped by it.
    <SidebarProvider
      data-drilldown-rail=""
      // An in-page rail, not an app shell: the wrapper must not claim the viewport's height
      // or the row's whole width.
      className={cn("min-h-0 w-auto", className)}
    >
      {/* `h-auto`, not the sidebar's own `h-full`: the column is bounded by a max-height and
          nothing else, so a percentage height has nothing definite to resolve against and
          falls back to the content's own. Letting the flex row stretch it is what keeps the
          list inside the cap — and therefore scrolling. */}
      <Sidebar collapsible="none" className="h-auto min-h-0 w-full bg-transparent">
        {search && <SidebarHeader className="p-0 pb-2">{search}</SidebarHeader>}
        <SidebarContent
          ref={navRef}
          role="navigation"
          aria-label="Regions"
          data-drilldown-selector=""
          onKeyDown={onKeyDown}
        >
          <SidebarGroup className="p-0">
            {view.parentId && (
              <SidebarMenuButton
                data-drilldown-back=""
                onClick={onBack}
                className="text-muted-foreground mb-1"
              >
                <ChevronLeft aria-hidden="true" />
                <span>Back to overview</span>
              </SidebarMenuButton>
            )}
            <SidebarMenu>
              {regions.topLevel.map((id) => {
                const region = regions.byId[id]
                if (!region) return null
                const open = expanded === id
                const kids = open || leaving === id ? childrenOf(id) : []
                const expandable = isExpandable(id)
                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      {...rowProps(id, {
                        label: region.label,
                        selected: selected === id,
                        tabbable: activeId === id,
                      })}
                      data-drillable={expandable ? "true" : undefined}
                      aria-expanded={expandable ? expanded === id : undefined}
                      isActive={selected === id}
                      onClick={(e) => onSelect(id, viaOf(e))}
                      className={ACTIVE_ROW}
                    >
                      <span>{region.label}</span>
                    </SidebarMenuButton>
                    {expandable && (
                      <SidebarMenuAction
                        data-region-toggle={id}
                        aria-label={`${expanded === id ? "Collapse" : "Expand"} ${region.label}`}
                        tabIndex={-1}
                        onClick={() => onToggle(id)}
                      >
                        <ChevronRight
                          aria-hidden="true"
                          className={cn("transition-transform", expanded === id && "rotate-90")}
                        />
                      </SidebarMenuAction>
                    )}
                    {kids.length > 0 && (
                      <Branch open={open}>
                        <SidebarMenuSub>
                          {kids.map((childId) => {
                            const child = regions.byId[childId]
                            if (!child) return null
                            return (
                              <SidebarMenuSubItem key={childId}>
                                <SidebarMenuSubButton
                                  render={
                                    <button
                                      {...rowProps(childId, {
                                        label: child.label,
                                        selected: selected === childId,
                                        tabbable: activeId === childId,
                                      })}
                                      onClick={(e) => onSelect(childId, viaOf(e))}
                                    />
                                  }
                                  isActive={selected === childId}
                                  className={ACTIVE_ROW}
                                >
                                  <span>{child.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            )
                          })}
                        </SidebarMenuSub>
                      </Branch>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
