import { getServerSideSitemap } from "next-sitemap"
import { getPayload } from "payload"
import config from "@payload-config"
import { unstable_cache } from "next/cache"

const getAuthorsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL

    const results = await payload.find({
      collection: "users",
      overrideAccess: true,
      draft: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        and: [
          {
            role: {
              in: ["writer", "editor", "chief-editor"],
            },
          },
          {
            slug: {
              not_equals: null,
            },
          },
        ],
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((user) => Boolean(user?.slug))
          .map((user) => ({
            loc: `${SITE_URL}/authors/${user.slug}`,
            lastmod: user.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ["authors-sitemap"],
  {
    tags: ["authors-sitemap"],
  },
)

export async function GET(): Promise<Response> {
  const sitemap = await getAuthorsSitemap()

  return getServerSideSitemap(sitemap)
}
