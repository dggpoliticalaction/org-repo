import { describe, expect, it } from "vitest"

import { DRILLDOWN_DATA_SCHEMA, type DrilldownData } from "../../types"
import { federalCourtsPresentation } from "../presentation"
import { composeFederalCourtsSummary } from "../summary"

const base = (over: Partial<DrilldownData> = {}): DrilldownData => ({
  schema: DRILLDOWN_DATA_SCHEMA,
  generatedAt: "2026-09-01T00:00:00.000Z",
  source: { name: "court-tracker", version: "abc" },
  regions: [
    { id: "scotus", label: "SCOTUS" },
    { id: "ca8", label: "8th Cir." },
    { id: "moed", label: "E.D. Mo.", parentId: "ca8" },
  ],
  records: [],
  ...over,
})

describe("composeFederalCourtsSummary", () => {
  it("finds the Supreme Court as the top-level court with nothing under it", () => {
    const summary = composeFederalCourtsSummary({
      presentation: federalCourtsPresentation,
      data: base({
        records: [
          { _region: "scotus", _id: "b", full_name: "B", commission_date: "2010-01-01" },
          { _region: "scotus", _id: "a", full_name: "A", commission_date: "1991-01-01" },
          { _region: "ca8", _id: "c", full_name: "C" },
        ],
      }),
    })
    expect(summary.supremeCourtRegion).toBe("scotus")
    // Seniority order: the display's own `order` field, ascending.
    expect(summary.supremeCourt.map((r) => r.full_name)).toEqual(["A", "B"])
  })

  it("leaves out an associate: a circuit justice is not a seat on the bench being drawn", () => {
    const summary = composeFederalCourtsSummary({
      presentation: federalCourtsPresentation,
      data: base({
        records: [
          { _region: "scotus", _id: "a", full_name: "A" },
          { _region: "scotus", _id: "j", _role: "associate", full_name: "Riding Circuit" },
        ],
      }),
    })
    expect(summary.supremeCourt.map((r) => r.full_name)).toEqual(["A"])
  })
})

const history = {
  appointments: [
    // Coverage starts in 1990, so the series starts a generation later, in 2020.
    { commission_date: "1990-02-01", president_party: "Republican", appointing_president: "R1" },
    { commission_date: "2019-03-01", president_party: "Democratic", appointing_president: "D1" },
    {
      commission_date: "2021-05-01",
      president_party: "Republican",
      appointing_president: "R2",
      termination_date: "2022-06-01",
    },
    { commission_date: "2021-05-15", president_party: "Republican", appointing_president: "R2" },
  ],
}

describe("composeFederalCourtsSummary — change over time", () => {
  const summary = composeFederalCourtsSummary({
    presentation: federalCourtsPresentation,
    data: base({ datasets: history }),
  })

  it("starts a judicial generation after coverage does, and says where coverage begins", () => {
    expect(summary.change).toMatchObject({ coverageFrom: 1990, startYear: 2020 })
  })

  it("counts who was still serving at the end of each year, dropping those who left", () => {
    // 2020, 2021: the 1990 and 2019 appointments stand; 2021 adds two more Republicans.
    const [republican, democratic] = summary.change!.series
    expect(republican).toMatchObject({ party: "Republican", counts: [1, 3, 2] })
    expect(democratic).toMatchObject({ party: "Democratic", counts: [1, 1, 1] })
  })

  it("has no series at all when the feed carries no history", () => {
    const bare = composeFederalCourtsSummary({
      presentation: federalCourtsPresentation,
      data: base(),
    })
    expect(bare.change).toBeNull()
    expect(bare.appointments).toBeNull()
  })
})

describe("composeFederalCourtsSummary — appointment history", () => {
  const summary = composeFederalCourtsSummary({
    presentation: federalCourtsPresentation,
    data: base({ datasets: history }),
  })

  it("buckets appointments by month and appointing president", () => {
    expect(summary.appointments).toMatchObject({ baseYear: 1990 })
    // Two commissions in the same month under the same president are one bucket of two.
    const may2021 = summary.appointments!.bursts.find((b) => b.count === 2)
    expect(may2021).toBeDefined()
    expect(summary.appointments!.presidents[may2021!.president]).toEqual({
      name: "R2",
      party: "Republican",
    })
  })

  it("keeps every appointment: the buckets sum to the rows the feed carried", () => {
    expect(summary.appointments!.bursts.reduce((n, b) => n + b.count, 0)).toBe(4)
  })

  it("carries a party of null for a row whose party the profile does not know", () => {
    const odd = composeFederalCourtsSummary({
      presentation: federalCourtsPresentation,
      data: base({
        datasets: {
          appointments: [
            {
              commission_date: "2000-01-01",
              president_party: "None (reassignment)",
              appointing_president: "n/a",
            },
          ],
        },
      }),
    })
    expect(odd.appointments!.presidents[0]).toEqual({ name: "n/a", party: null })
  })
})
