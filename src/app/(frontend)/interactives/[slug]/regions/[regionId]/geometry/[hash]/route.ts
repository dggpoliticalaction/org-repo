import { loadInteractiveGeometry, queryInteractiveBySlug } from "@/interactives/load"

interface Args {
  params: Promise<{ slug: string; regionId: string }>
}

/**
 * One region's shapes, and nothing that changes with the data.
 *
 * The `hash` segment is not read: it is a content hash of the geometry, put in the URL by the
 * page so that a reprojection issues a different URL. That is what lets this be cached
 * forever — a map held past its own change is a map nobody can clear, so the URL has to move
 * when the map does rather than the cache having to be short.
 *
 * Serving it apart from the records is the point of the split: the records change every time
 * the sync finds something, and used to drag a map that had not moved along with them.
 */
export async function GET(_req: Request, { params }: Args): Promise<Response> {
  const { slug, regionId } = await params
  const interactive = await queryInteractiveBySlug(slug)
  if (!interactive) return Response.json({ error: "not found" }, { status: 404 })
  const geometry = await loadInteractiveGeometry(interactive, regionId)
  if (!geometry) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json(geometry, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
