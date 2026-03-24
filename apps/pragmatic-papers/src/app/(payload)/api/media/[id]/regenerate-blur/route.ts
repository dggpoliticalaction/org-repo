import { type NextRequest, NextResponse } from "next/server"

import type { RegenerateBlurResponse } from "@/collections/Media/types"
import { getBlurDataUrlFromBuffer } from "@/utilities/getBlurDataUrlFromBuffer"
import { getPayloadConfig } from "@/utilities/getPayloadConfig"
import { getServerSideURL } from "@/utilities/getURL"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const payload = await getPayloadConfig()
  const { id } = await params

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const mediaId = parseInt(id, 10)
  if (isNaN(mediaId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
  }

  const media = await payload.findByID({
    collection: "media",
    id: mediaId,
    overrideAccess: false,
    user,
  })

  if (!media.mimeType?.startsWith("image/")) {
    return NextResponse.json({ error: "Media is not an image" }, { status: 400 })
  }

  if (!media.url) {
    return NextResponse.json({ error: "Media has no URL" }, { status: 400 })
  }

  const imageUrl = media.url.startsWith("http") ? media.url : `${getServerSideURL()}${media.url}`

  const imageResponse = await fetch(imageUrl)
  if (!imageResponse.ok) {
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
  const blurDataURL = await getBlurDataUrlFromBuffer(imageBuffer)

  await payload.update({
    collection: "media",
    id: mediaId,
    data: { blurDataURL },
    overrideAccess: false,
    user,
  })

  return NextResponse.json<RegenerateBlurResponse>({ blurDataURL })
}
