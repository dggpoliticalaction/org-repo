import type { Payload } from 'payload'
import type { User } from '@/payload-types'

const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const createAuthors = async (payload: Payload, writers: User[]): Promise<void> => {
  for (const writer of writers) {
    if (!writer?.id) continue

    const name = writer.name || writer.email || 'Author'
    const slug = slugify(String(name))

    await payload.create({
      collection: 'authors',
      data: {
        name,
        slug,
        user: writer.id,
        biography: writer.biography ?? undefined,
      },
    })
  }
}
