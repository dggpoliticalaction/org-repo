import type { Payload } from 'payload'
import type { Media, Volume } from '@/payload-types'

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

const createEditorsNote = (content: string) => ({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: content,
            type: 'text',
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    type: 'root',
    version: 1,
  },
})

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
        editorsNote: createEditorsNote(config.editorsNoteContent),
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
