import type { Media, User } from '@/payload-types'
import type { Payload } from 'payload'
import { createRichTextFromString } from './richtext'

export interface SeededUsers {
  admin: User
  chiefEditor: User
  editor: User
  writer1: User
  writer2: User
}

export const createUsers = async (payload: Payload, media: Media[]): Promise<SeededUsers> => {
  // Create an admin user (just in case you configured your admin account strangely)
  const admin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'password123',
      name: 'John Admin',
      role: 'admin',
      slug: 'superadmin',
      profileImage: media[0]?.id,
    },
  })

  const chiefEditor = await payload.create({
    collection: 'users',
    data: {
      email: 'chiefeditor@example.com',
      password: 'password123',
      name: 'Jane Chief',
      role: 'chief-editor',
      slug: 'chiefjane',
      profileImage: media[1]?.id,
    },
  })

  // It's helpful to see what an editor can see with restricted access
  const editor = await payload.create({
    collection: 'users',
    draft: true,
    data: {
      email: 'editor@example.com',
      password: 'password123',
      name: 'Stacy The Editor',
      role: 'editor',
      slug: 'stacytheeditor',
      profileImage: media[2]?.id,
    },
  })

  const writer1 = await payload.create({
    collection: 'users',
    draft: false,
    data: {
      email: 'writer1@example.com',
      password: 'password123',
      name: 'Teagan Wordsmith',
      slug: 'teagan-wordsmith',
      role: 'writer',
      biography: createRichTextFromString(
        'A prolific writer specializing in academic research and scientific papers.',
      ),
    },
  })

  const writer2 = await payload.create({
    collection: 'users',
    draft: false,
    data: {
      email: 'writer2@example.com',
      password: 'password123',
      name: 'Sienna Scribe',
      slug: 'sienna-scribe',
      role: 'writer',
      biography: createRichTextFromString(
        'An experienced researcher with focus on theoretical physics and mathematics.',
      ),
    },
  })

  return { admin, chiefEditor, editor, writer1, writer2 }
}
