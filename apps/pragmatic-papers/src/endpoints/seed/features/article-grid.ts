import type { Payload, RequiredDataFromCollectionSlug } from "payload"
import type { ArticleGridBlock } from "@/payload-types"
import { layouts, type ArticleGridLayoutKey } from "@/blocks/ArticleGrid/layouts"
import { createRichTextFromString } from "../richtext"

/**
 * Builds the `slots` array for an ArticleGrid block from an ordered array of article IDs.
 */
function createSlots(
  layoutKey: ArticleGridLayoutKey,
  articleIds: number[],
): ArticleGridBlock["slots"] {
  const expected = layouts[layoutKey].slotDescriptions.length
  if (articleIds.length !== expected) {
    throw new Error(
      `Layout "${layoutKey}" requires exactly ${expected} articles, received ${articleIds.length}`,
    )
  }
  return articleIds.map((articleId) => ({
    article: articleId,
    kicker: null,
    overrideTitle: null,
  })) as unknown as ArticleGridBlock["slots"]
}

/**
 * Creates the home page with ArticleGrid blocks and saves it to the `pages` collection.
 *
 * The page mirrors the exported homepage.json layout:
 *   1. Content block  – "Vespucci Style Article Grid"
 *   2. ArticleGrid    – vespucci-7 layout
 *   3. Content block  – "Fibonacci Style Article Grid"
 *   4. ArticleGrid    – fibonacci-7 layout
 *   5. Content block  – "Miami 3 Style Article Grid"
 *   6. ArticleGrid    – miami-3 layout
 *   7. Content block  – "Miami 5 Style Article Grid"
 *   8. ArticleGrid    – miami-5 layout
 *   9. Content block  – "Omaha 4 Style Article Grid"
 *  10. ArticleGrid    – omaha-4 layout
 *  11. Content block  – "Speranza 6 Style Article Grid"
 *  12. ArticleGrid    – Speranza-6 layout
 *
 * @param volume1ArticleIds - IDs for volume 1 articles (6 articles)
 * @param volume2ArticleIds - IDs for volume 2 articles (at least 2 needed)
 * @param featureArticleIds - IDs for feature articles (index 2 = legacySocialEmbed, index 3 = mediaCollage)
 */
export async function createArticleGridHomePage(
  payload: Payload,
  volume1ArticleIds: number[],
  volume2ArticleIds: number[],
  featureArticleIds: number[],
): Promise<void> {
  // Vespucci grid: 6 articles from volume 1 + article 2 from volume 2 (slot f)
  const vespucciArticleIds = [
    ...volume1ArticleIds.slice(0, 6),
    volume2ArticleIds[1]!, // "Irony as Ideology" (2nd volume-2 article)
  ]

  // Fibonacci grid: 6 articles from volume 1 + article 1 from volume 2 (slot f)
  const fibonacciArticleIds = [
    ...volume1ArticleIds.slice(0, 6),
    volume2ArticleIds[0]!, // "Dawkins vs. Blackmore" (1st volume-2 article)
  ]

  // Miami-3 grid: vol1[0], vol1[4], vol2[1]
  const miami3ArticleIds = [
    volume1ArticleIds[0]!, // "The Trolley Problem Revisited"
    volume1ArticleIds[4]!, // "Simone de Beauvoir's Ethics of Ambiguity"
    volume2ArticleIds[1]!, // "Irony as Ideology"
  ]

  // Miami-5 grid: featureArticles[3], vol1[1], featureArticles[2], vol1[5], vol1[5]
  const miami5ArticleIds = [
    featureArticleIds[3]!, // mediaCollage – "Grids, Carousels, and Captions"
    volume1ArticleIds[1]!, // "Free Will and Determinism"
    featureArticleIds[2]!, // legacySocialEmbed – "Legacy Social Media Embed Test"
    volume1ArticleIds[5]!, // "Epistemic Injustice"
    volume1ArticleIds[5]!, // "Epistemic Injustice" (repeated)
  ]

  // Omaha-4 grid: vol1[2], vol2[0], vol2[0], vol1[0]
  const omaha4ArticleIds = [
    volume1ArticleIds[2]!, // "Plato's Cave in the Digital Age"
    volume2ArticleIds[0]!, // "Dawkins vs. Blackmore"
    volume2ArticleIds[0]!, // "Dawkins vs. Blackmore" (repeated)
    volume1ArticleIds[0]!, // "The Trolley Problem Revisited"
  ]

  // Speranza-6 grid: vol1[1], vol1[0], vol1[2], vol1[5], vol2[0], vol1[2]
  const speranza6ArticleIds = [
    volume1ArticleIds[1]!, // "Free Will and Determinism"
    volume1ArticleIds[0]!, // "The Trolley Problem Revisited"
    volume1ArticleIds[2]!, // "Plato's Cave in the Digital Age"
    volume1ArticleIds[5]!, // "Epistemic Injustice"
    volume2ArticleIds[0]!, // "Dawkins vs. Blackmore"
    volume1ArticleIds[2]!, // "Plato's Cave in the Digital Age" (repeated)
  ]

  const homeData: RequiredDataFromCollectionSlug<"pages"> = {
    title: "Home",
    slug: "home",
    generateSlug: false,
    _status: "published",
    publishedAt: new Date().toISOString(),
    hero: {
      type: "pageHero",
      richText: createRichTextFromString("Article Grid Home Page Demo!"),
      links: [],
      media: null,
    },
    layout: [
      {
        blockType: "content",
        columns: [
          {
            size: "full",
            richText: createRichTextFromString("Vespucci Style Article Grid"),
            enableLink: false,
          },
        ],
      },
      {
        blockType: "articleGrid",
        blockName: "Vespucci",
        layout: "vespucci-7",
        slots: createSlots("vespucci-7", vespucciArticleIds),
      },
      {
        blockType: "content",
        columns: [
          {
            size: "full",
            richText: createRichTextFromString("Fibonacci Style Article Grid"),
            enableLink: false,
          },
        ],
      },
      {
        blockType: "articleGrid",
        blockName: "Fibonacci",
        layout: "fibonacci-7",
        slots: createSlots("fibonacci-7", fibonacciArticleIds),
      },
      {
        blockType: "content",
        columns: [
          {
            size: "full",
            richText: createRichTextFromString("Miami 3 Style Article Grid"),
            enableLink: false,
          },
        ],
      },
      {
        blockType: "articleGrid",
        layout: "miami-3",
        slots: createSlots("miami-3", miami3ArticleIds),
      },
      {
        blockType: "content",
        columns: [
          {
            size: "full",
            richText: createRichTextFromString("Miami 5 Style Article Grid"),
            enableLink: false,
          },
        ],
      },
      {
        blockType: "articleGrid",
        layout: "miami-5",
        slots: createSlots("miami-5", miami5ArticleIds),
      },
      {
        blockType: "content",
        columns: [
          {
            size: "full",
            richText: createRichTextFromString("Omaha 4 Style Article Grid"),
            enableLink: false,
          },
        ],
      },
      {
        blockType: "articleGrid",
        layout: "omaha-4",
        slots: createSlots("omaha-4", omaha4ArticleIds),
      },
      {
        blockType: "content",
        columns: [
          {
            size: "full",
            richText: createRichTextFromString("Speranza 6 Style Article Grid"),
            enableLink: false,
          },
        ],
      },
      {
        blockType: "articleGrid",
        layout: "Speranza-6",
        slots: createSlots("Speranza-6", speranza6ArticleIds),
      },
    ],
    meta: {
      title: null,
      image: null,
      description: null,
    },
  }

  await payload.create({ collection: "pages", data: homeData })
}
