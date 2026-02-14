import type { Payload } from 'payload'
import type { Media, Volume } from '@/payload-types'
import { createRichTextFromString } from './richtext'

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
): Promise<CreateVolumesResult> => {
  const volumes: Volume[] = []

  for (const config of volumeConfigs) {
    const volume = await payload.create({
      collection: 'volumes',
      data: {
        title: config.title,
        volumeNumber: config.volumeNumber,
        description: config.description,
        editorsNote: createRichTextFromString(config.editorsNoteContent),
        articles: config.articleIds,
        _status: 'published',
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
