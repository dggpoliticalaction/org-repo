import type { CollectionBeforeChangeHook } from "payload"
import type { Article } from "@/payload-types"

/**
 * BeforeChange hook that populates meta.image from heroImage
 * when meta.image is not already set. Tracks auto-population
 * so user can manually clear meta.image without it being re-populated.
 */
export const populateMetaImageFromHero: CollectionBeforeChangeHook<Article> = ({ data }) => {
  // If meta.image is empty and heroImage is set, and we haven't auto-populated before
  if (!data.meta?.image && data.heroImage && !data.meta?.imageAutoPopulated) {
    data.meta = {
      ...data.meta,
      image: data.heroImage,
      imageAutoPopulated: true,
    }
  }

  // If user manually cleared meta.image, update the flag
  if (!data.meta?.image && data.meta?.imageAutoPopulated) {
    data.meta = {
      ...data.meta,
      imageAutoPopulated: false,
    }
  }

  return data
}
