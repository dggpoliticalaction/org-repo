import type { Metadata } from "next"

import type { Page, Volume, Article } from "../payload-types"

import { mergeOpenGraph } from "./mergeOpenGraph"
import { getMediaUrl } from "./getMediaUrl"
import { getServerSideURL } from "./getURL"

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Volume> | Partial<Article> | null
  path?: string
}): Promise<Metadata> => {
  const { doc, path } = args
  const ogImage =
    typeof doc?.meta?.image === "object" ? getMediaUrl(doc?.meta?.image?.sizes?.og?.url) : undefined

  const title = doc?.meta?.title ? doc?.meta?.title : "Pragmatic Papers"
  const description = doc?.meta?.description || ""

  const canonicalPath = path || (Array.isArray(doc?.slug) ? `/${doc?.slug.join("/")}` : "/")
  const canonicalUrl = `${getServerSideURL()}${canonicalPath}`

  return {
    description: doc?.meta?.description,
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
      url: canonicalPath,
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description: description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    title,
  }
}
