import type { Media } from '@/payload-types'

/**
 * Fetches a file from a URL and returns a File object compatible with Payload
 */
export async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()
  const extension = url.split('.').pop()?.toLowerCase() || ''

  // Map file extensions to proper MIME types
  const mimeTypeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  }

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: mimeTypeMap[extension] || `image/${extension}`,
    size: data.byteLength,
  }
}

/**
 * Creates a media document in Payload from a URL
 * @param payload - Payload instance
 * @param url - URL of the file to fetch
 * @param alt - Alt text for the media
 * @param additionalData - Optional additional data to include (e.g., caption)
 * @returns The created media document
 */
export async function createMediaFromURL(
  payload: Payload,
  url: string,
  alt: string,
  additionalData?: Partial<Omit<Media, 'id' | 'alt'>>,
): Promise<Media> {
  const file = await fetchFileByURL(url)

  return await payload.create({
    collection: 'media',
    data: {
      alt,
      ...additionalData,
    },
    file,
  })
}
