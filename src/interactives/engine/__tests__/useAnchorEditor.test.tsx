import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { MapStage } from "@/interactives/engine/stage"
import { ANCHOR_EDIT_PARAM, LAYOUT_TOOL_NOTES } from "@/interactives/engine/layoutTools"
import { useAnchorEditor } from "@/interactives/engine/useAnchorEditor"

function fakeStage(): { stage: MapStage; setAnchorEditing: ReturnType<typeof vi.fn> } {
  const setAnchorEditing = vi.fn()
  const stage = {
    setAnchorEditing,
    movedAnchorsJSON: () => '{"ca9":[1,2]}',
    movedRegionsJSON: () => '{"akd":[3,4]}',
  } as unknown as MapStage
  return { stage, setAnchorEditing }
}

const helper = (name: string): (() => string) | undefined =>
  (window as unknown as Record<string, (() => string) | undefined>)[name]

describe("useAnchorEditor", () => {
  it("does nothing at all without the query", () => {
    const { stage, setAnchorEditing } = fakeStage()
    renderHook(() => useAnchorEditor(stage, false))
    expect(setAnchorEditing).not.toHaveBeenCalled()
    expect(helper("drilldownAnchors")).toBeUndefined()
  })

  it("turns on for anyone who asks, and hands them both dumps", () => {
    const { stage, setAnchorEditing } = fakeStage()
    renderHook(() => useAnchorEditor(stage, true))
    expect(setAnchorEditing).toHaveBeenCalledWith(true)
    expect(helper("drilldownAnchors")?.()).toBe('{"ca9":[1,2]}')
    expect(helper("drilldownOffsets")?.()).toBe('{"akd":[3,4]}')
  })

  it("puts the map back when it goes away", () => {
    const { stage, setAnchorEditing } = fakeStage()
    const { unmount } = renderHook(() => useAnchorEditor(stage, true))
    unmount()
    expect(setAnchorEditing).toHaveBeenLastCalledWith(false)
    expect(helper("drilldownAnchors")).toBeUndefined()
    expect(helper("drilldownOffsets")).toBeUndefined()
  })

  it("documents itself with the query it actually watches for", () => {
    // The footer prints these, so a note naming a different switch would be worse than none.
    expect(LAYOUT_TOOL_NOTES.map((note) => String(note.value)).join(" ")).toContain(
      `?${ANCHOR_EDIT_PARAM}=1`,
    )
  })
})
