import type { Payload } from 'payload'
import { homeStatic } from './home-static'
import { createUsers } from './users'
import { createArticles } from './articles'
import { createVolumes } from './volumes'
import { createMedia } from './media'

export const seed = async (payload: Payload): Promise<void> => {
  const { writer1, writer2 } = await createUsers(payload)

  const { mediaDocs } = await createMedia(payload)

  const articleResults = await createArticles(
    payload,
    [writer1, writer2],
    [
      {
        volumeNumber: 1,
        numberOfArticles: 6,
      },
      {
        volumeNumber: 2,
        numberOfArticles: 3,
      },
    ],
    mediaDocs,
  )

  // Ensure article IDs exist
  const volume1Articles = articleResults.volume1Articles
  const volume2Articles = articleResults.volume2Articles
  if (!volume1Articles || !volume2Articles) {
    throw new Error('Failed to create articles for one or more volumes')
  }

  await createVolumes(
    payload,
    [
      {
        volumeNumber: 1,
        title: 'Volume 1: Foundations of Philosophy',
        description:
          'A comprehensive collection of foundational philosophy papers covering various topics.',
        editorsNoteContent:
          'This inaugural volume brings together six groundbreaking papers that lay the foundation for future research.',
        articleIds: volume1Articles,
      },
      {
        volumeNumber: 2,
        title: 'Volume 2: Advanced Studies in Memes',
        description:
          'A focused collection of three in-depth research papers exploring advanced topics in memes.',
        editorsNoteContent:
          'This volume presents three comprehensive studies that push the boundaries of current research in memes.',
        articleIds: volume2Articles,
      },
    ],
    mediaDocs,
  )

  // The homepage is literally a "page" in Payload.
  await payload.create({
    collection: 'pages',
    data: homeStatic,
  })
}
