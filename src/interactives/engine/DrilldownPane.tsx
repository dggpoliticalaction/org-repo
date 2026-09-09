"use client"

import { Armchair, History } from "lucide-react"
import React, { useEffect, useImperativeHandle, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/utilities/utils"

import {
  AssociateNode,
  DrilldownBench,
  type BenchMode,
  type SupernumeraryMode,
} from "./DrilldownBench"
import { Segmented } from "./Segmented"
import { DrilldownDetail, type DetailSelection, type Lookups } from "./DrilldownDetail"
import { fieldString } from "./recordFormat"
import { buildBench, type RegionRecords } from "./records"
import type { DisplayFact } from "./regions"
import type { DrilldownRecord, RecordDisplay, RegionInfo } from "./types"

/** Ask the pane to pin one record; the nonce lets the same record be re-pinned. */
export interface PinRequest {
  recordId: string
  nonce: number
}

export interface DrilldownPaneHandle {
  /** Move keyboard focus to the pane's heading (after a keyboard selection). */
  focusHeading(): void
}

interface DrilldownPaneProps {
  region: RegionInfo | null
  facts: DisplayFact[]
  /** Side tables a `portrait` detail line reads, from the payload covering this region. */
  lookups?: Lookups
  records: RegionRecords
  recordsState: "idle" | "loading" | "error"
  open: boolean
  canDrill: boolean
  /** Shown in the empty state, before a region is chosen. */
  emptyHint?: string
  /** Replaces the empty state with an overview of the whole dataset, when one is supplied. */
  summary?: React.ReactNode
  /** A record to pin as soon as it is among the region's loaded records (search results). */
  pinRequest?: PinRequest | null
  /** Which record the reader has pinned, so the page can put it in the URL. */
  onPin?(recordId: string | null): void
  onDrill(): void
  /** Whether the body is showing. The header stays either way — it is the way back in. */
  /** What the header says before a region is chosen, when the body is the profile's overview. */
  overviewLabel?: string
  ref?: React.Ref<DrilldownPaneHandle>
}

/**
 * The region's details: its facts, its bench as a timeline or a seat chart, and the docked
 * record card. A section in flow beneath the map, always present, with an empty state before
 * a region is chosen.
 */
export function DrilldownPane({
  region,
  facts,
  lookups,
  records,
  recordsState,
  open,
  canDrill,
  emptyHint = "Select a region on the map to see its details.",
  summary,
  pinRequest = null,
  onPin,
  onDrill,
  overviewLabel = "Overview",
  ref,
}: DrilldownPaneProps): React.ReactElement {
  const [mode, setMode] = useState<BenchMode>("seats")
  // Hidden by default: an outer band of senior judges doubles the chart's size to answer a
  // question the reader did not ask first. The control names them, so it is discoverable.
  const [supernumeraryMode, setSupernumeraryMode] = useState<SupernumeraryMode>("hide")
  const [mark, setMark] = useState<string | null>(null)
  const [detail, setDetail] = useState<DetailSelection | null>(null)
  const headingRef = useRef<HTMLHeadingElement | null>(null)
  const [now] = useState(() => new Date())

  useImperativeHandle(ref, () => ({ focusHeading: () => headingRef.current?.focus() }))

  // A new region starts with no pinned or leftover detail.
  const regionId = region?.id ?? null
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset per region selection
    setDetail(null)
  }, [regionId])

  // A search result names a record whose region asset may still be loading: pin it as soon as
  // the records that contain it arrive, and leave the reader's own pin alone otherwise.
  const pinNonce = pinRequest?.nonce ?? null
  const pinId = pinRequest?.recordId ?? null
  useEffect(() => {
    if (!pinId) return
    const seat = records.seats.find((r) => r._id === pinId)
    if (seat && records.display) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pin requested from outside
      setDetail({ record: seat, display: records.display, pinned: true })
      return
    }
    const associate = records.associates.find((a) => a.record._id === pinId)
    if (associate) setDetail({ record: associate.record, display: associate.display, pinned: true })
  }, [pinId, pinNonce, records])

  const display: RecordDisplay | null = records.display
  const bench = display
    ? buildBench(records.seats, display, region?.facts[display.seatsFact ?? ""])
    : null
  const associate = records.associates[0] ?? null
  const showSupernumeraryRow = (bench?.supernumerary.length ?? 0) > 0
  const supLabel = display?.status?.supernumerary?.[0]
    ? (display.status.labels?.[display.status.supernumerary[0]] ?? "Others")
    : "Others"
  /**
   * What the amber rings mean, said in words: the field, the value it matched and how much of
   * the bench that is. The label comes from the detail line that already describes the field,
   * so a profile never spells it twice. A cohort of one is neither ringed nor captioned.
   */
  const cohort = ((): { value: string; label: string; count: number; total: number } | null => {
    const field = display?.cohort
    if (!field || !detail) return null
    const value = fieldString(detail.record, field)
    if (value === null) return null
    const pool = records.seats
    const count = pool.filter((r) => fieldString(r, field) === value).length
    if (count < 2) return null
    const detailLabel = display?.details?.find((d) => d.field === field)?.label
    return {
      value,
      label: detailLabel ? `${detailLabel} ${value}` : value,
      count,
      total: pool.length,
    }
  })()

  const hoverRecord = (record: DrilldownRecord | null, recDisplay: RecordDisplay | null): void => {
    if (detail?.pinned) return
    setDetail(record && recDisplay ? { record, display: recDisplay, pinned: false } : null)
  }
  const clickRecord = (record: DrilldownRecord, recDisplay: RecordDisplay): void => {
    const unpin = detail?.pinned && detail.record === record
    const id = record._id
    onPin?.(unpin || typeof id !== "string" ? null : id)
    setDetail(unpin ? null : { record, display: recDisplay, pinned: true })
  }

  // Notes split by what they are for. An `always` note (a territorial district's holdover
  // rule) is its own small fact and stays a line under the bench. A `seats` note explains the
  // supernumerary control itself — what "Senior" and its options mean — wherever that control
  // is drawn, in either view, which is a tooltip on the control rather than a paragraph below
  // whatever happens to be on screen when the reader opened it.
  const alwaysNotes = (region?.notes ?? []).filter((n) => n.mode === "always")
  const seatsNote = region?.notes.find((n) => n.mode === "seats")?.text ?? null

  return (
    <section
      data-drilldown-pane=""
      data-open={open ? "" : undefined}
      aria-label={region ? `${region.label} details` : "Region details"}
      className={cn(
        // Its own container query: the bench/detail split is a property of the pane's width,
        // not the map's. No card around it — it sits inside the map's area, which is the box.
        "@container flex min-h-0 scroll-mt-20 flex-col",
      )}
      onClick={() => detail?.pinned && setDetail((d) => (d ? { ...d, pinned: false } : d))}
    >
      {/* The pane's name, and only that: a heading, looking like this site's headings, with
          nothing folded into it. Opening and closing the pane is the panel button over the
          map, which is where a reader goes for it and where the rail's own button is. Only the
          size is set here — the display face, weight and tracking are the ones every other
          heading on the site has, and a pane 384px wide has no room for `text-3xl`. */}
      <h2
        ref={headingRef}
        // Focusable only by script: a keyboard selection lands here so the reader arrives at
        // the top of what they just opened, but it is not a stop on the way through the page.
        tabIndex={-1}
        data-drilldown-pane-title=""
        // `leading-none` restated: the site's global heading rule already sets it, but
        // `text-2xl` carries its own line-height and, same specificity, wins over the base
        // layer — so this heading alone sat in a line box taller than its own glyphs.
        className="shrink-0 px-2 py-1.5 text-2xl leading-none outline-none"
      >
        {region?.label ?? overviewLabel}
      </h2>

      {!region &&
        (summary ? (
          <div data-drilldown-summary="" className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {summary}
          </div>
        ) : (
          <p
            data-drilldown-empty=""
            className="text-muted-foreground flex min-h-14 items-center justify-center px-4 py-3 text-center text-sm"
          >
            {emptyHint}
          </p>
        ))}

      {region && (
        // Horizontal inset matches the heading's (`px-2`) rather than carrying its own wider
        // one: the seat arc reads its width from this box, and every pixel of side padding is
        // a pixel the dome doesn't get. Vertical padding is unrelated and stays generous.
        <div className="-mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-2 py-4 sm:py-5">
          {/* No heading of its own: the sheet's bar carries the region's name, and saying it
              twice a line apart is one name too many. What is left here is what the bar does
              not say — the counts, and the facts the summary line leaves out. */}
          <header className="flex flex-wrap items-start gap-x-4 gap-y-1">
            <div className="min-w-0 flex-1">
              {region.summary && <p className="text-muted-foreground text-sm">{region.summary}</p>}
              {facts.length > 0 && (
                <dl className="text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                  {facts.map((f) => (
                    <div key={f.key} className="flex gap-1.5">
                      <dt>{f.label}</dt>
                      <dd className="text-foreground font-medium">{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {associate && mode === "timeline" && (
                <AssociateNode
                  inline
                  record={associate.record}
                  display={associate.display}
                  onHover={(r) => hoverRecord(r, associate.display)}
                  onClick={(r) => clickRecord(r, associate.display)}
                />
              )}
            </div>
          </header>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {display && (
              <Segmented<BenchMode>
                label="View"
                hideLabel
                value={mode}
                options={[
                  {
                    value: "seats",
                    label: "Seats",
                    icon: Armchair,
                    hint: "Seats — the bench now, by seat",
                  },
                  {
                    value: "timeline",
                    label: "Timeline",
                    icon: History,
                    hint: "Timeline — every commission, in order",
                  },
                ]}
                onChange={setMode}
              />
            )}
            {display?.marks?.length ? (
              <Segmented
                label="Mark"
                value={mark ?? "__none"}
                options={[
                  { value: "__none", label: "None" },
                  ...display.marks.map((m) => ({ value: m.field, label: m.label })),
                ]}
                onChange={(v) => setMark(v === "__none" ? null : v)}
              />
            ) : null}
            {showSupernumeraryRow && (
              <Segmented<SupernumeraryMode>
                label={supLabel}
                labelHint={seatsNote}
                // A timeline has no seats and no majority, so only two of the three mean
                // anything in it.
                value={
                  mode === "timeline" && supernumeraryMode === "include"
                    ? "show"
                    : supernumeraryMode
                }
                // "Show" puts them beside the bench; "Include" puts them in it.
                options={
                  mode === "timeline"
                    ? [
                        {
                          value: "hide",
                          label: "Hidden",
                          hint: `${supLabel} members are left off the timeline.`,
                        },
                        {
                          value: "show",
                          label: "Shown",
                          hint: `${supLabel} members take their place in the timeline, by the same date as everyone else.`,
                        },
                      ]
                    : [
                        {
                          value: "hide",
                          label: "Hidden",
                          hint: `${supLabel} members are left off the chart.`,
                        },
                        {
                          value: "show",
                          label: "Alongside",
                          hint: `${supLabel} members sit in an outer band, outside the seats and outside the majority.`,
                        },
                        {
                          value: "include",
                          label: "Counted",
                          hint: `${supLabel} members take seats in the chart and count toward the majority.`,
                        },
                      ]
                }
                onChange={setSupernumeraryMode}
              />
            )}
            {canDrill && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-drilldown-drill=""
                onClick={onDrill}
                className="ml-auto"
              >
                View {region.childrenLabel ?? "details"} →
              </Button>
            )}
          </div>

          {/* No `min-h-0` on this row or the column inside it: their default `min-height:
              auto` is what a plain nested flex chain has anyway, and it is what lets the
              bench's own floor (DrilldownBench.tsx) reach all the way up to the ONE place
              that should act on it — the scrolling wrapper this whole region sits in. Cut
              anywhere along that chain, the floor stops one level short of where it is read
              and whatever sits below it — first found with the detail card — overflows a box
              smaller than what it had just insisted on being. */}
          <div className="flex flex-1 flex-col gap-4 @2xl:flex-row @2xl:items-stretch">
            <div className="flex min-w-0 flex-1 flex-col">
              {recordsState === "loading" && (
                <p
                  className="text-muted-foreground py-6 text-center text-sm"
                  data-drilldown-loading=""
                >
                  Loading…
                </p>
              )}
              {recordsState === "error" && (
                <p className="text-destructive py-6 text-center text-sm" data-drilldown-error="">
                  Details could not be loaded.
                </p>
              )}
              {recordsState === "idle" && bench && display && (
                <DrilldownBench
                  bench={bench}
                  display={display}
                  mode={mode}
                  supernumeraryMode={supernumeraryMode}
                  mark={mark}
                  associate={associate?.record ?? null}
                  cohortValue={cohort?.value ?? null}
                  onHover={(r) => hoverRecord(r, display)}
                  onClick={(r) => clickRecord(r, display)}
                />
              )}
              {recordsState === "idle" && !display && (
                <p className="text-muted-foreground py-6 text-center text-sm">
                  No records for this region.
                </p>
              )}
              {recordsState === "idle" && cohort && (
                <p
                  data-drilldown-cohort=""
                  className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs"
                >
                  <span
                    aria-hidden="true"
                    className="inline-block size-2.5 shrink-0 rounded-full ring-2 ring-amber-400"
                  />
                  {cohort.label} · {cohort.count} of {cohort.total}
                </p>
              )}
              {alwaysNotes.map((n, i) => (
                <p
                  key={i}
                  className="text-muted-foreground mt-2 text-xs italic"
                  data-drilldown-note=""
                >
                  {n.text}
                </p>
              ))}
            </div>
            {display && <DrilldownDetail selection={detail} now={now} lookups={lookups} />}
          </div>
        </div>
      )}
    </section>
  )
}
