/**
 * The map's layout tools, described in one place so the footer and the code that wires them
 * cannot drift apart. No imports: a server component reads this to print the notes, and
 * pulling it out of the hook module dragged the whole client stage into the server render.
 */

/** The query the map watches for. Nothing is wired without it, on any page, for anybody. */
export const ANCHOR_EDIT_PARAM = "anchors"

/**
 * What the tools are, said out loud in the footer's info popup.
 *
 * They are not hidden because they are dangerous. Everything they touch is already in the
 * payload the page ships, and nothing they do is saved — a drag ends as a number in the
 * console, and the file it belongs in is one somebody has to edit by hand. So a reader curious
 * enough to look is welcome to them, and there is no account to check.
 */
export const LAYOUT_TOOL_NOTES = [
  { label: "Layout tools", value: `?${ANCHOR_EDIT_PARAM}=1` },
  { label: "Drag", value: "a seat block, or a region's shape" },
  { label: "Print", value: "drilldownAnchors(), drilldownOffsets()" },
] as const
