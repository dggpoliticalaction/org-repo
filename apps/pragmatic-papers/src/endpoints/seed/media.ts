import type { Payload, File } from 'payload'
import type { Media } from '@/payload-types'

interface CreateMediaResult {
  mediaDocs: Media[]
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}

export const createMedia = async (payload: Payload): Promise<CreateMediaResult> => {
  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])
  const mediaDocs = await Promise.all([
    payload.create({
      collection: 'media',
      data: { alt: 'Curving abstract shapes with an orange and blue gradient' },
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Curving abstract shapes with an orange and blue gradient' },
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Curving abstract shapes with an orange and blue gradient' },
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: { alt: 'Curving abstract shapes with an orange and blue gradient' },
      file: hero1Buffer,
    }),
  ])

  return { mediaDocs }
}
