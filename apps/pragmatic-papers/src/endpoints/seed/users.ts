import type { Media, User } from '@/payload-types'
import type { Payload } from 'payload'

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
    data: {
      email: 'writer1@example.com',
      password: 'password123',
      name: 'Teagan Wordsmith',
      role: 'writer',
      slug: 'teaganwordsmith',
      affiliation: 'Senior Research Fellow, Pragmatic Papers Institute',
      biography: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'A prolific writer specializing in rigorous academic research, long-form analysis, and clear explanations of complex ideas.',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
              textFormat: 0,
              textStyle: '',
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
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
        },
      ],
      profileImage: media[0]?.id,
    },
  })

  const writer2 = await payload.create({
    collection: 'users',
    data: {
      email: 'writer2@example.com',
      password: 'password123',
      name: 'Sienna Scribe',
      role: 'writer',
      slug: 'siennascribe',
      affiliation: 'Associate Editor, Department of Theoretical Studies',
      biography: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'An experienced researcher focused on theoretical frameworks, mathematical modeling, and the bridge between theory and practice.',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
              textFormat: 0,
              textStyle: '',
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
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
      profileImage: media[1]?.id,
    },
  })

  return { admin, chiefEditor, editor, writer1, writer2 }
}
