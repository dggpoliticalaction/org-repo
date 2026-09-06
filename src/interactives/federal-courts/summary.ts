import { fieldString } from "@/blocks/InteractiveMap/drilldown/recordFormat"
import type { DrilldownRecord } from "@/blocks/InteractiveMap/drilldown/types"

import type { DrilldownData, DrilldownPresentation } from "../types"

/**
 * What the landing view of the Federal Courts page shows before a reader picks a circuit: the
 * Supreme Court's bench, and how the whole bench has moved. The district judgeships are the
 * map's job — it draws a seat block for every court — so the summary does not draw them twice.
 *
 * Composed on the server from the snapshot. It carries **values** — which party appointed the
 * holder of a seat, which district a square belongs to — and never a colour. The component
 * reads colours from the profile's `presentation.ts`, the same place the map's seat blocks and
 * the bench read them, so the three can never disagree.
 */

/** A seat's party in the vocabulary the rest of the profile uses, or null when vacant. */
export type SeatParty = string | null

export interface ChangeSeries {
  party: SeatParty
  /** One count per year from `startYear`, in step. */
  counts: number[]
}

export interface BenchChange {
  startYear: number
  series: ChangeSeries[]
  /** Earliest commission the history covers, which is why the chart cannot start there. */
  coverageFrom: number
}

export interface AppointmentBurst {
  /** Months since `baseYear` January. */
  month: number
  /** Index into `presidents`. */
  president: number
  count: number
}

export interface AppointmentHistory {
  baseYear: number
  presidents: { name: string; party: SeatParty }[]
  bursts: AppointmentBurst[]
}

export interface FederalCourtsSummary {
  /** The Supreme Court's bench, in the display's own order. */
  supremeCourt: DrilldownRecord[]
  /** Region id the Supreme Court seats belong to, so a click can select it. */
  supremeCourtRegion: string | null
  /** How the sitting bench's composition moved, or null when the feed carries no history. */
  change: BenchChange | null
  /** Every appointment the history covers, bucketed by month and appointing president. */
  appointments: AppointmentHistory | null
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v)

interface AppointmentRow {
  commission: string
  termination: string | null
  president: string
  party: SeatParty
}

function readAppointments(
  datasets: DrilldownData["datasets"],
  presentation: DrilldownPresentation,
): AppointmentRow[] {
  const raw = datasets?.appointments
  if (!Array.isArray(raw)) return []
  const known = presentation.display.category.values.map((v) => v.value)
  const rows: AppointmentRow[] = []
  for (const item of raw) {
    if (!isRecord(item)) continue
    const commission = item.commission_date
    if (typeof commission !== "string" || commission.length < 7) continue
    const party = item.president_party
    const president = item.appointing_president
    rows.push({
      commission,
      termination: typeof item.termination_date === "string" ? item.termination_date : null,
      president: typeof president === "string" ? president : "",
      party: typeof party === "string" && known.includes(party) ? party : null,
    })
  }
  return rows
}

const year = (iso: string): number => Number(iso.slice(0, 4))

/**
 * How many judges appointed by each party were serving at the end of each year.
 *
 * The history only reaches back to its first commission, so a judge appointed the year before
 * it starts is invisible and the early years undercount the bench badly. The series therefore
 * begins a full judicial generation after coverage does — a federal judge's tenure runs
 * decades, so by then almost everyone still serving was commissioned inside the window — and
 * carries `coverageFrom` so the chart can say why it starts where it does.
 */
const GENERATION_YEARS = 30

function composeChange(
  rows: AppointmentRow[],
  presentation: DrilldownPresentation,
): BenchChange | null {
  if (rows.length === 0) return null
  const coverageFrom = Math.min(...rows.map((r) => year(r.commission)))
  // Departures move the composition too, so the series runs to the last change of any kind,
  // not merely to the last appointment.
  const endYear = Math.max(
    ...rows.map((r) => year(r.commission)),
    ...rows.filter((r) => r.termination !== null).map((r) => year(r.termination!)),
  )
  const startYear = coverageFrom + GENERATION_YEARS
  if (!Number.isFinite(startYear) || startYear > endYear) return null

  const parties = presentation.display.category.values.map((v) => v.value)
  const series: ChangeSeries[] = parties.map((party) => ({ party, counts: [] }))
  for (let y = startYear; y <= endYear; y++) {
    const counts = new Map<SeatParty, number>()
    for (const row of rows) {
      if (year(row.commission) > y) continue
      if (row.termination !== null && year(row.termination) <= y) continue
      counts.set(row.party, (counts.get(row.party) ?? 0) + 1)
    }
    for (const s of series) s.counts.push(counts.get(s.party) ?? 0)
  }
  return { startYear, series, coverageFrom }
}

function composeAppointments(rows: AppointmentRow[]): AppointmentHistory | null {
  if (rows.length === 0) return null
  const baseYear = Math.min(...rows.map((r) => year(r.commission)))
  const presidents: { name: string; party: SeatParty }[] = []
  const indexOf = new Map<string, number>()
  const buckets = new Map<string, AppointmentBurst>()

  for (const row of rows) {
    let index = indexOf.get(row.president)
    if (index === undefined) {
      index = presidents.length
      indexOf.set(row.president, index)
      presidents.push({ name: row.president, party: row.party })
    }
    const month = (year(row.commission) - baseYear) * 12 + (Number(row.commission.slice(5, 7)) - 1)
    if (!Number.isFinite(month) || month < 0) continue
    const key = `${month}:${index}`
    const hit = buckets.get(key)
    if (hit) hit.count += 1
    else buckets.set(key, { month, president: index, count: 1 })
  }

  const bursts = [...buckets.values()].sort(
    (a, b) => a.month - b.month || a.president - b.president,
  )
  return { baseYear, presidents, bursts }
}

export function composeFederalCourtsSummary({
  presentation,
  data,
}: {
  presentation: DrilldownPresentation
  data: DrilldownData
}): FederalCourtsSummary {
  // The Supreme Court is the one top-level court with nothing under it: every circuit has
  // districts. Derived rather than hardcoded, so a feed that renames the id keeps working.
  const hasChildren = new Set(data.regions.map((r) => r.parentId).filter(Boolean))
  const scotusRegion = data.regions.find((r) => !r.parentId && !hasChildren.has(r.id))?.id ?? null

  const supremeCourt = scotusRegion
    ? data.records
        .filter((r) => r._region === scotusRegion && r._role !== "associate")
        .sort((a, b) => {
          const key = presentation.display.order
          const av = fieldString(a, key) ?? ""
          const bv = fieldString(b, key) ?? ""
          return av.localeCompare(bv)
        })
    : []

  const appointmentRows = readAppointments(data.datasets, presentation)

  return {
    supremeCourt,
    supremeCourtRegion: scotusRegion,
    change: composeChange(appointmentRows, presentation),
    appointments: composeAppointments(appointmentRows),
  }
}
