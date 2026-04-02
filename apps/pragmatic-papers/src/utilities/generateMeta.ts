import type { Metadata } from "next"

import type { Article, Page, Topic, Volume } from "../payload-types"

import { getMediaUrl } from "./getMediaUrl"
import { getServerSideURL } from "./getURL"
import { mergeOpenGraph } from "./mergeOpenGraph"

const DEFAULT_DESCRIPTION =
  "Pragmatic, community-driven articles focusing on news, politics, economics, and more."

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Volume> | Partial<Article> | Partial<Topic> | null
  canonicalPath?: string
}): Promise<Metadata> => {
  const { doc, canonicalPath } = args
  const ogImage =
    typeof doc?.meta?.image === "object" ? getMediaUrl(doc?.meta?.image?.sizes?.og?.url) : undefined

  const title = doc?.meta?.title ? doc?.meta?.title : "The Pragmatic Papers"
  const description = doc?.meta?.description || DEFAULT_DESCRIPTION
  const canonicalUrl = `${getServerSideURL()}${canonicalPath}`

  return {
    alternates: {
      canonical: canonicalUrl,
    },
    description,
    openGraph: mergeOpenGraph({
      description,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: canonicalUrl,
    }),
    title,
  }
}
