// src/collections/Media/hooks/generateBlurDataUrl.ts
import type { Media } from "@/payload-types"
import { type CollectionBeforeChangeHook } from "payload"
import sharp from "sharp"

export const generateBlurDataUrl: CollectionBeforeChangeHook<Media> = async ({ data, req }) => {
  const { file } = req

  // Only run when a file is actually being uploaded
  if (!file || !file.mimetype?.startsWith("image/")) {
    return data
  }

  try {
    req.payload.logger.info(`Generating blur data URL for: ${file.name}`)

    const blurBuffer = await sharp(file.data)
      .resize(10, 10, { fit: "inside" })
      .blur(1)
      .png({ quality: 20 })
      .toBuffer()

    data.blurDataURL = `data:image/png;base64,${blurBuffer.toString("base64")}`
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    req.payload.logger.error(`Failed to generate blur data URL: ${message}`)
  }

  return data
}
