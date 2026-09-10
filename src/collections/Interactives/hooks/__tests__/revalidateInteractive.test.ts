import { beforeEach, describe, expect, it, vi } from "vitest"

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }))

import { revalidateInteractive, revalidateInteractiveDelete } from "../revalidateInteractive"

interface Doc {
  id: number
  slug?: string | null
  _status?: "draft" | "published" | null
}

const req = (disableRevalidate = false) => ({
  payload: { logger: { info: vi.fn() } },
  context: { disableRevalidate },
})

const change = (doc: Doc, previousDoc?: Doc, disableRevalidate = false) =>
  ({ doc, previousDoc, req: req(disableRevalidate) }) as never

const PAGE_TAGS = [
  ["interactive:1", "max"],
  ["interactives-sitemap", "max"],
]

beforeEach(() => {
  revalidatePath.mockClear()
  revalidateTag.mockClear()
})

describe("revalidateInteractive", () => {
  it("drops the page, its data and the sitemap when a version is published", () => {
    const doc = { id: 1, slug: "courts", _status: "published" as const }
    expect(revalidateInteractive(change(doc))).toBe(doc)
    expect(revalidatePath.mock.calls).toEqual([["/interactives/courts"]])
    expect(revalidateTag.mock.calls).toEqual(PAGE_TAGS)
  })

  it("leaves every cache alone for a draft of something never published", () => {
    const doc = { id: 1, slug: "courts", _status: "draft" as const }
    revalidateInteractive(change(doc, { ...doc }))
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it("drops the old path when a published interactive is unpublished", () => {
    revalidateInteractive(
      change(
        { id: 1, slug: "courts", _status: "draft" },
        { id: 1, slug: "courts", _status: "published" },
      ),
    )
    expect(revalidatePath.mock.calls).toEqual([["/interactives/courts"]])
    expect(revalidateTag.mock.calls).toEqual(PAGE_TAGS)
  })

  it("drops both the new and the old path when a published slug moves", () => {
    revalidateInteractive(
      change(
        { id: 1, slug: "federal-courts", _status: "published" },
        { id: 1, slug: "courts", _status: "published" },
      ),
    )
    expect(revalidatePath.mock.calls).toEqual([
      ["/interactives/federal-courts"],
      ["/interactives/courts"],
    ])
  })

  it("does nothing when the caller disabled revalidation", () => {
    const doc = { id: 1, slug: "courts", _status: "published" as const }
    expect(revalidateInteractive(change(doc, undefined, true))).toBe(doc)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe("revalidateInteractiveDelete", () => {
  it("drops the page, its data and the sitemap", () => {
    const doc = { id: 1, slug: "courts" }
    expect(revalidateInteractiveDelete({ doc, req: req() } as never)).toBe(doc)
    expect(revalidatePath).toHaveBeenCalledWith("/interactives/courts")
    expect(revalidateTag.mock.calls).toEqual(PAGE_TAGS)
  })

  it("does nothing when the caller disabled revalidation", () => {
    revalidateInteractiveDelete({ doc: { id: 1, slug: "courts" }, req: req(true) } as never)
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
