import type { Payload } from 'payload'
import type { User } from '@/payload-types'

interface Users {
  admin: User
  editor: User
  writer1: User
  writer2: User
}

export const createUsers = async (payload: Payload): Promise<Users> => {
  // Create an admin user (just in case you configured your admin account strangely)
  const admin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    },
  })

  // It's helpful to see what an editor can see with restricted access
  const editor = await payload.create({
    collection: 'users',
    data: {
      email: 'editor@example.com',
      password: 'password123',
      name: 'Editor User',
      role: 'editor',
    },
  })

  const writer1 = await payload.create({
    collection: 'users',
    data: {
      email: 'writer1@example.com',
      password: 'password123',
      name: 'Writer One',
      role: 'writer',
      authorSlug: 'writer-one',
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
      socialLinks: [
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
    },
  })

  const writer2 = await payload.create({
    collection: 'users',
    data: {
      email: 'writer2@example.com',
      password: 'password123',
      name: 'Writer Two',
      role: 'writer',
      authorSlug: 'writer-two',
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
      socialLinks: [
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

  return { admin, editor, writer1, writer2 }
}
