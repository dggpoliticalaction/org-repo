"use client"

import { useEffect } from "react"

import type { MapStage } from "./stage"

/** The query the map watches for. Nothing happens without it, on any page, for anybody. */
export const ANCHOR_EDIT_PARAM = "anchors"

/**
 * Whether an editor has asked to drag the seat blocks, and is allowed to.
 *
 * Anchors are code — checked into `anchors.json`, measured against the geometry beside it — so
 * moving one has meant guessing numbers, reloading, and guessing again. Turning this on makes
 * the map itself the tool: drag a block and the position it lands at is printed in the form
 * the file wants, ready to paste.
 *
 * Two gates, and only the first one matters. The query has to be there, so nobody who did not
 * ask for this ever meets a map whose furniture slides around under the pointer. And Payload
 * has to know who is asking, which is a courtesy rather than a defence — every anchor is
 * already in the payload the page ships, and dragging one changes nothing a reader could save.
 * Treat it as "not for readers", not as a permission.
 */
export function useAnchorEditor(stage: MapStage | null, enabled: boolean): void {
  useEffect(() => {
    if (!stage || !enabled) return
    let live = true
    const check = async (): Promise<void> => {
      try {
        const res = await fetch("/api/users/me", { credentials: "include" })
        const body: unknown = res.ok ? await res.json() : null
        const user = body && typeof body === "object" ? (body as { user?: unknown }).user : null
        if (!live || !user) return
        stage.setAnchorEditing(true)
        // The console is the whole interface. Anything cleverer would be a feature to
        // maintain, and this is a ruler.
        // eslint-disable-next-line no-console -- printing is what this tool is
        console.info(
          "[interactive-map] layout editing on. Drag a seat block, or a region's shape. " +
            "`drilldownAnchors()` prints the blocks for geometry/anchors.json; " +
            "`drilldownOffsets()` prints the shapes for geometry/offsets.json.",
        )
        const expose = (name: string, read: () => string): void => {
          ;(window as unknown as Record<string, unknown>)[name] = (): string => {
            const json = read()
            // eslint-disable-next-line no-console -- printing is what this tool is
            console.info(json)
            return json
          }
        }
        expose("drilldownAnchors", () => stage.movedAnchorsJSON())
        expose("drilldownOffsets", () => stage.movedRegionsJSON())
      } catch {
        // Not signed in, or no Payload to ask. Either way the map stays a map.
      }
    }
    void check()
    return () => {
      live = false
      stage.setAnchorEditing(false)
      delete (window as unknown as Record<string, unknown>).drilldownAnchors
      delete (window as unknown as Record<string, unknown>).drilldownOffsets
    }
  }, [stage, enabled])
}
