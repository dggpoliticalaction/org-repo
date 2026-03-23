import { generateMeta } from "@/utilities/generateMeta"
import configPromise from "@payload-config"
import type { Metadata } from "next"
import { draftMode } from "next/headers"
import { getPayload } from "payload"
import PageTemplate from "./[slug]/page"

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: "pages",
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: "home" } },
  })
  return generateMeta({ doc: docs[0] || null, canonicalPath: "/" })
}

export default PageTemplate
