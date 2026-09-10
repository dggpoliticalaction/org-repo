import { beforeEach, describe, expect, it, vi } from "vitest"

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))
vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }))

import { revalidateSnapshot, revalidateSnapshotDelete } from "../revalidateSnapshot"

interface Snapshot {
  id: number
  interactive: number | { id: number } | null
  _status?: "draft" | "published" | null
}

const findByID = vi.fn()
const warn = vi.fn()

const req = (disableRevalidate = false) => ({
  payload: { findByID, logger: { warn } },
  context: { disableRevalidate },
})

const change = (doc: Snapshot, previousDoc?: Snapshot, disableRevalidate = false) =>
  ({ doc, previousDoc, req: req(disableRevalidate) }) as never

const published: Snapshot = { id: 9, interactive: 3, _status: "published" }
const drafted: Snapshot = { id: 9, interactive: 3, _status: "draft" }

beforeEach(() => {
  vi.clearAllMocks()
  findByID.mockResolvedValue({ id: 3, slug: "courts" })
})

describe("revalidateSnapshot", () => {
  it("drops the interactive's data and page when a snapshot is published", async () => {
    await expect(revalidateSnapshot(change(published, drafted))).resolves.toBe(published)
    expect(revalidateTag).toHaveBeenCalledWith("interactive:3", "max")
    expect(findByID).toHaveBeenCalledWith({
      collection: "interactives",
      id: 3,
      depth: 0,
      overrideAccess: true,
    })
    expect(revalidatePath).toHaveBeenCalledWith("/interactives/courts")
  })

  it("reads the interactive's id off a populated relationship too", async () => {
    await revalidateSnapshot(change({ ...published, interactive: { id: 3 } }))
    expect(revalidateTag).toHaveBeenCalledWith("interactive:3", "max")
  })

  it("drops caches when a published snapshot is unpublished", async () => {
    await revalidateSnapshot(change(drafted, published))
    expect(revalidateTag).toHaveBeenCalledWith("interactive:3", "max")
    expect(revalidatePath).toHaveBeenCalledWith("/interactives/courts")
  })

  it("ignores a draft written over a draft — the sync's everyday write", async () => {
    await revalidateSnapshot(change(drafted, drafted))
    expect(revalidateTag).not.toHaveBeenCalled()
    expect(findByID).not.toHaveBeenCalled()
  })

  it("does nothing for a snapshot with no interactive", async () => {
    await revalidateSnapshot(change({ ...published, interactive: null }))
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it("still drops the data tag when the page path can't be resolved", async () => {
    findByID.mockRejectedValue(new Error("gone"))
    await revalidateSnapshot(change(published))
    expect(revalidateTag).toHaveBeenCalledWith("interactive:3", "max")
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("gone"))
  })

  it("skips the path for an interactive with no slug", async () => {
    findByID.mockResolvedValue({ id: 3, slug: null })
    await revalidateSnapshot(change(published))
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it("does nothing when the caller disabled revalidation", async () => {
    await revalidateSnapshot(change(published, undefined, true))
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})

describe("revalidateSnapshotDelete", () => {
  it("drops the interactive's data and page", async () => {
    await expect(revalidateSnapshotDelete({ doc: published, req: req() } as never)).resolves.toBe(
      published,
    )
    expect(revalidateTag).toHaveBeenCalledWith("interactive:3", "max")
    expect(revalidatePath).toHaveBeenCalledWith("/interactives/courts")
  })

  it("does nothing when the caller disabled revalidation", async () => {
    await revalidateSnapshotDelete({ doc: published, req: req(true) } as never)
    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
