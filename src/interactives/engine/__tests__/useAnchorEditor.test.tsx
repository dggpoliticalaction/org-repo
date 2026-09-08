import { renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import type { MapStage } from "@/interactives/engine/stage"
import { useAnchorEditor } from "@/interactives/engine/useAnchorEditor"

function fakeStage(): { stage: MapStage; setAnchorEditing: ReturnType<typeof vi.fn> } {
  const setAnchorEditing = vi.fn()
  const stage = { setAnchorEditing, movedAnchorsJSON: () => "{}" } as unknown as MapStage
  return { stage, setAnchorEditing }
}

const answerWith = (body: unknown, ok = true): void => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ ok, json: async () => body }) as unknown as Response),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
  delete (window as unknown as Record<string, unknown>).drilldownAnchors
})

describe("useAnchorEditor", () => {
  it("does nothing at all without the query, and asks nobody", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const { stage, setAnchorEditing } = fakeStage()
    renderHook(() => useAnchorEditor(stage, false))
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(setAnchorEditing).not.toHaveBeenCalled()
  })

  it("turns on for someone Payload knows, and hands them the dump", async () => {
    answerWith({ user: { id: 1 } })
    const { stage, setAnchorEditing } = fakeStage()
    renderHook(() => useAnchorEditor(stage, true))
    await waitFor(() => expect(setAnchorEditing).toHaveBeenCalledWith(true))
    expect(typeof (window as unknown as { drilldownAnchors?: unknown }).drilldownAnchors).toBe(
      "function",
    )
  })

  it("leaves a reader with the query alone", async () => {
    answerWith({ user: null })
    const { stage, setAnchorEditing } = fakeStage()
    renderHook(() => useAnchorEditor(stage, true))
    // Nothing to wait for, so give the fetch a turn and then assert it changed nothing.
    await new Promise((r) => setTimeout(r, 10))
    expect(setAnchorEditing).not.toHaveBeenCalledWith(true)
    expect((window as unknown as { drilldownAnchors?: unknown }).drilldownAnchors).toBeUndefined()
  })

  it("puts the map back when it goes away", async () => {
    answerWith({ user: { id: 1 } })
    const { stage, setAnchorEditing } = fakeStage()
    const { unmount } = renderHook(() => useAnchorEditor(stage, true))
    await waitFor(() => expect(setAnchorEditing).toHaveBeenCalledWith(true))
    unmount()
    expect(setAnchorEditing).toHaveBeenLastCalledWith(false)
    expect((window as unknown as { drilldownAnchors?: unknown }).drilldownAnchors).toBeUndefined()
  })
})
