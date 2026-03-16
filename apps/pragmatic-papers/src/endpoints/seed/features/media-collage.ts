import type { Payload } from "payload"
import type { User, Media } from "@/payload-types"
import { createMediaFromURL } from "../media"
import {
  createRichTextFromString,
  createParagraph,
  createEmptyParagraph,
  createRichText,
} from "../richtext"
import { createArticle } from "../articles"

/**
 * Helper to create a media block
 */
function createMediaBlock(mediaId: number) {
  return {
    type: "block",
    fields: {
      blockType: "mediaBlock",
      media: mediaId,
    },
    format: "",
    version: 2,
  }
}

/**
 * Helper to create a media collage block
 */
function createMediaCollageBlock(mediaIds: number[], layout: "grid" | "carousel" = "grid") {
  return {
    type: "block",
    fields: {
      blockType: "mediaCollage",
      layout,
      images: mediaIds.map((id) => ({
        media: id,
      })),
    },
    format: "",
    version: 2,
  }
}

export const createMediaCollageArticle = async (
  payload: Payload,
  writer: User,
  mediaDocs: Media[],
  context?: Record<string, unknown>,
): Promise<number> => {
  // Create media with captions
  const [itsBadMedia, blueCoatMedia] = await Promise.all([
    createMediaFromURL(
      payload,
      "https://wikicdn.destiny.gg/f/fd/ITSBAD.png",
      "It's bad, what do you want me to say!",
      {
        caption: createRichTextFromString("It's bad, what do you want me to say!"),
      },
      context,
    ),
    createMediaFromURL(
      payload,
      "https://wikicdn.destiny.gg/6/64/BlueCoat.jpg",
      "A snazzy blue jacket",
      {
        caption: createRichTextFromString("A snazzy blue jacket"),
      },
      context,
    ),
  ])

  // Build the article content programmatically
  const content = createRichText([
    createParagraph("First, Click on an image to see a modal pop up. It displays captions!"),
    createMediaBlock(itsBadMedia.id),
    createEmptyParagraph(),
    createParagraph("Try viewing a grid of images!"),
    createMediaCollageBlock(
      [mediaDocs[3]?.id, mediaDocs[0]?.id, mediaDocs[2]?.id, mediaDocs[1]?.id].filter(
        (id): id is number => id !== undefined,
      ),
      "grid",
    ),
    createEmptyParagraph(),
    createParagraph("View them in a carousel! Click for modals!"),
    createMediaCollageBlock(
      [mediaDocs[3]?.id, mediaDocs[0]?.id, mediaDocs[2]?.id].filter(
        (id): id is number => id !== undefined,
      ),
      "carousel",
    ),
    createEmptyParagraph(),
    createParagraph("Mix and match! Carousel with different images!"),
    createMediaCollageBlock(
      [mediaDocs[1]?.id, blueCoatMedia.id, mediaDocs[2]?.id, itsBadMedia.id].filter(
        (id): id is number => id !== undefined,
      ),
      "carousel",
    ),
    createEmptyParagraph(),
    createParagraph("Another grid layout with differently shaped images!"),
    createMediaCollageBlock(
      [mediaDocs[0]?.id, itsBadMedia.id, blueCoatMedia.id].filter(
        (id): id is number => id !== undefined,
      ),
      "grid",
    ),
  ])

  // Create the article
  const title = "Grids, Carousels, and Captions: Exploring Rich Media Layouts"
  const article = await createArticle(payload, {
    title,
    content,
    authors: [writer.id],
    slug: "grids-carousels-captions-exploring-rich-media-layouts",
    heroImage: mediaDocs[Math.floor(Math.random() * mediaDocs.length)]?.id,
    meta: {
      title,
      description:
        "Demonstration of the media collage feature with grid and carousel layouts, showing clickable images with captions.",
      image: mediaDocs[0]?.id,
    },
  }, context)

  return article.id
}
