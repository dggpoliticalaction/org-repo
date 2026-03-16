import type { Media, Volume } from "@/payload-types"
import { createRichTextFromString } from "./richtext"
import type { Payload } from "payload"

interface VolumeConfig {
  volumeNumber: number
  title: string
  description: string
  editorsNoteContent: string
  articleIds: number[]
}

interface CreateVolumesResult {
  volumes: Volume[]
}

export const createVolumes = async (
  payload: Payload,
  volumeConfigs: VolumeConfig[],
  mediaDocs: Media[],
  context?: Record<string, unknown>,
): Promise<CreateVolumesResult> => {
  const volumes: Volume[] = []

  for (const config of volumeConfigs) {
    const volume = await payload.create({
      collection: "volumes",
      ...(context && { context }),
      data: {
        title: config.title,
        volumeNumber: config.volumeNumber,
        description: config.description,
        editorsNote: createRichTextFromString(config.editorsNoteContent),
        articles: config.articleIds,
        slug: config.volumeNumber.toString(),
        _status: "published",
        publishedAt: new Date().toISOString(),
        meta: {
          title: config.title,
          description: config.description,
          image: mediaDocs[config.volumeNumber % mediaDocs.length]?.id,
        },
      },
    })
    volumes.push(volume)
  }

  return { volumes }
}
