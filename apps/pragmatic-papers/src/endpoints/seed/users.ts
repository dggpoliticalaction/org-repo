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
      affiliation: "Senior Research Fellow, Pragmatic Papers Institute",
      biography: createRichTextFromString(
        'A prolific writer specializing in academic research and scientific papers.',
      ),
      profileImage: media[3]?.id,
      socials: [
        {
          link: {
            type: 'custom',
            url: 'https://twitter.com/writer_one',
            label: 'Twitter',
            newTab: true,
          },
        },
        {
          link: {
            type: 'custom',
            url: 'https://github.com/writer-one',
            label: 'GitHub',
            newTab: true,
          },
        },
        {
          link: {
            type: 'custom',
            url: 'https://scholar.google.com',
            label: 'Google Scholar',
            newTab: true,
          },
        }
      ],
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
      affiliation: "Associate Editor, Department of Theoretical Studies",
      biography: createRichTextFromString(
        'An experienced researcher with focus on theoretical physics and mathematics.',
      ),
      profileImage: media[0]?.id,
      socials: [
        {
          link: {
            type: 'custom',
            url: 'https://twitter.com/writer_two',
            label: 'Twitter',
            newTab: true,
          },
        },
        {
          link: {
            type: 'custom',
            url: 'https://github.com/writer-two',
            label: 'GitHub',
            newTab: true,
          },
        },
        {
          link: {
            type: 'custom',
            url: 'https://orcid.org',
            label: 'ORCID',
            newTab: true,
          },
        },
      ],
    },
  })

  return { admin, chiefEditor, editor, writer1, writer2 }
}
