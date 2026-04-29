import type { CollectionBeforeChangeHook } from "payload"
import type { Article } from "@/payload-types"

/**
 * BeforeChange hook that populates meta.image from heroImage
 * when meta.image is empty and useHeroImage is checked.
 */
export const populateMetaImageFromHero: CollectionBeforeChangeHook<Article> = ({ data }) => {
  if (data.meta?.useHeroImage !== false && !data.meta?.image && data.heroImage) {
    data.meta = {
      ...data.meta,
      image: data.heroImage,
    }
  }

  return data
}
