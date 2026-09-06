"use client"

import React, { useRef } from "react"

import { cn } from "@/utilities/utils"

import type { RegionIndex } from "./types"

export type SelectVia = "pointer" | "keyboard"

interface DrilldownSelectorProps {
  regions: RegionIndex
  view: { parentId: string | null }
  selected: string | null
  drillable: Set<string>
  /** Regions whose children are showing beneath them. */
  expanded: Set<string>
  onSelect(regionId: string, via: SelectVia): void
  onToggle(regionId: string): void
  onBack(): void
  className?: string
}

const viaOf = (e: React.MouseEvent): SelectVia => (e.detail === 0 ? "keyboard" : "pointer")

function Item({
  label,
  selected,
  tabbable,
  onSelect,
  onToggle,
  regionId,
  expandable,
  expanded,
  depth,
}: {
  label: string
  selected: boolean
  tabbable: boolean
  onSelect(via: SelectVia): void
  onToggle(): void
  regionId: string
  expandable: boolean
  expanded: boolean
  depth: number
}): React.ReactElement {
  return (
    <div className="flex items-stretch gap-0.5">
      <button
        type="button"
        data-region-item={regionId}
        data-drillable={expandable ? "true" : undefined}
        aria-pressed={selected}
        aria-expanded={expandable ? expanded : undefined}
        tabIndex={tabbable ? 0 : -1}
        onClick={(e) => onSelect(viaOf(e))}
        // Court names run to "District of the Northern Mariana Islands"; the rail is sized
        // for most of them and this is how a reader gets the rest.
        title={label}
        className={cn(
          "focus-visible:ring-ring/60 flex min-w-0 flex-1 items-center rounded-md py-1.5 pr-2 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2",
          depth > 0 ? "pl-3" : "pl-2.5",
          selected
            ? "bg-foreground text-background hover:bg-foreground"
            : "text-foreground hover:bg-muted",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </button>
      {expandable && (
        <button
          type="button"
          data-region-toggle={regionId}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
          tabIndex={-1}
          onClick={onToggle}
          className="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/60 w-6 shrink-0 rounded-md text-xs outline-none focus-visible:ring-2"
        >
          <span
            aria-hidden="true"
            className={cn("inline-block transition-transform", expanded && "rotate-90")}
          >
            ›
          </span>
        </button>
      )}
    </div>
  )
}

/**
 * The region rail: every top-level region down the left of the stage, each drillable one
 * opening to show its own children in place. A tree rather than a strip that swaps its
 * contents, so the reader can see where a district sits without first having to go there.
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
  className,
}: DrilldownSelectorProps): React.ReactElement {
  const navRef = useRef<HTMLElement | null>(null)
  const childrenOf = (id: string): string[] => regions.childrenOf[id] ?? []
  const isExpandable = (id: string): boolean => drillable.has(id) || childrenOf(id).length > 0
  const visible: string[] = []
  for (const id of regions.topLevel) {
    visible.push(id)
    if (expanded.has(id)) visible.push(...childrenOf(id))
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
      if (!isExpandable(id) || expanded.has(id) === (e.key === "ArrowRight")) return
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
    <nav
      ref={navRef}
      aria-label="Regions"
      data-drilldown-selector=""
      onKeyDown={onKeyDown}
      className={cn("flex min-w-0 flex-col gap-0.5", className)}
    >
      {view.parentId && (
        <button
          type="button"
          data-drilldown-back=""
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/60 rounded-md px-2.5 py-1.5 text-left text-sm font-medium outline-none focus-visible:ring-2"
        >
          ← Back to overview
        </button>
      )}
      <ul className="flex flex-col gap-0.5">
        {regions.topLevel.map((id) => {
          const region = regions.byId[id]
          if (!region) return null
          const kids = expanded.has(id) ? childrenOf(id) : []
          return (
            <li key={id}>
              <Item
                regionId={id}
                label={region.label}
                selected={selected === id}
                tabbable={activeId === id}
                expandable={isExpandable(id)}
                expanded={expanded.has(id)}
                depth={0}
                onSelect={(via) => onSelect(id, via)}
                onToggle={() => onToggle(id)}
              />
              {kids.length > 0 && (
                <ul className="border-border mt-0.5 ml-3 flex flex-col gap-0.5 border-l pl-1">
                  {kids.map((childId) => {
                    const child = regions.byId[childId]
                    if (!child) return null
                    return (
                      <li key={childId}>
                        <Item
                          regionId={childId}
                          label={child.label}
                          selected={selected === childId}
                          tabbable={activeId === childId}
                          expandable={false}
                          expanded={false}
                          depth={1}
                          onSelect={(via) => onSelect(childId, via)}
                          onToggle={() => onToggle(childId)}
                        />
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
