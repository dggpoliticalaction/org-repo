import type { Metadata } from "next"

import type { Page, Volume, Article, Topic } from "../payload-types"

import { mergeOpenGraph } from "./mergeOpenGraph"
import { getMediaUrl } from "./getMediaUrl"
import { getServerSideURL } from "./getURL"

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Volume> | Partial<Article> | Partial<Topic> | null
  url?: string
}): Promise<Metadata> => {
  const { doc, url: passedUrl } = args
  const ogImage =
    typeof doc?.meta?.image === "object" ? getMediaUrl(doc?.meta?.image?.sizes?.og?.url) : undefined

  const title = doc?.meta?.title ? doc?.meta?.title : "Pragmatic Papers"

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || "",
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: passedUrl ? `${getServerSideURL()}${passedUrl}` : (Array.isArray(doc?.slug) ? `${getServerSideURL()}/${doc?.slug.join("/")}` : getServerSideURL()),
    }),
    title,
  }
}
