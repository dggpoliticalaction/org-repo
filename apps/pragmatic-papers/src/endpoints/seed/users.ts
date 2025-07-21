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
                  text: 'A prolific writer specializing in academic research and scientific papers.',
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
    },
  })

  const writer2 = await payload.create({
    collection: 'users',
    data: {
      email: 'writer2@example.com',
      password: 'password123',
      name: 'Writer Two',
      role: 'writer',
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
                  text: 'An experienced researcher with focus on theoretical physics and mathematics.',
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
    },
  })

  return { admin, editor, writer1, writer2 }
}
