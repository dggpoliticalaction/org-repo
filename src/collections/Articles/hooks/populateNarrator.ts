import type { Article } from "@/payload-types"
import type { CollectionAfterReadHook } from "payload"

export const populateNarrator: CollectionAfterReadHook<Article> = async ({
  doc,
  req: { payload, context },
}) => {
  if (context.skipAfterRead) return doc
  if (!doc.narration) return doc

  let narratorId: number | null = null

  if (typeof doc.narration === "number") {
    try {
      const narrationDoc = await payload.findByID({
        id: doc.narration,
        collection: "media",
        overrideAccess: true,
        depth: 0,
      })
      if (narrationDoc?.narrator) {
        narratorId =
          typeof narrationDoc.narrator === "number"
            ? narrationDoc.narrator
            : narrationDoc.narrator.id
      }
    } catch {
      return doc
    }
  } else {
    if (doc.narration.narrator) {
      narratorId =
        typeof doc.narration.narrator === "number"
          ? doc.narration.narrator
          : doc.narration.narrator.id
    }
  }

  if (!narratorId) return doc

  try {
    const narratorDoc = await payload.findByID({
      id: narratorId,
      collection: "users",
      overrideAccess: true,
      depth: 0,
    })
    if (narratorDoc) {
      doc.populatedNarrator = {
        id: String(narratorDoc.id),
        name: narratorDoc.name,
        slug: narratorDoc.slug,
      }
    }
  } catch {
    // swallow error
  }

  return doc
}
