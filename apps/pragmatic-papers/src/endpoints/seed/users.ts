import type { Payload } from 'payload'
import type { User } from '@/payload-types'

interface Users {
  admin: User
  writer1: User
  writer2: User
}

export const createUsers = async (payload: Payload): Promise<Users> => {
  // Create an admin user
  const admin = await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    },
  })

  // Create writers
  const writer1 = await payload.create({
    collection: 'users',
    data: {
      email: 'writer1@example.com',
      password: 'password123',
      name: 'Writer One',
      role: 'writer',
      biography: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'A prolific writer specializing in academic research and scientific papers.',
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
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
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  text: 'An experienced researcher with focus on theoretical physics and mathematics.',
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
  })

  return { admin, writer1, writer2 }
}
