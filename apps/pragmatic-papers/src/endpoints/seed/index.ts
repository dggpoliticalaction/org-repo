import type { Payload } from 'payload'
import { createFootnotesArticle } from './features/footnotes'
import { createMediaCollageArticle } from './features/media-collage'
import { createSocialEmbedArticle, createLegacySocialEmbedArticle } from './features/social-embeds'
import { homeStatic } from './home-static'
import { createMediaFromURL } from './media'
import { createMenus } from './menus'
import { createPages } from './pages'
import { createLoremIpsumContent, generateLoremIpsumParagraph } from './richtext'
import { createArticle, validateWriters, getWriterOrThrow } from './articles'
import { createUsers } from './users'
import { createVolumes } from './volumes'

export const seed = async (payload: Payload): Promise<void> => {
  // Delete all content before seeding
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        in: [
          'admin@example.com',
          'chiefeditor@example.com',
          'editor@example.com',
          'writer1@example.com',
          'writer2@example.com',
        ],
      },
    },
  })

  await payload.delete({
    collection: 'articles',
    where: {},
  })

  await payload.delete({
    collection: 'volumes',
    where: {},
  })

  await payload.delete({
    collection: 'media',
    where: {},
  })

  await payload.delete({
    collection: 'pages',
    where: {},
  })

  // Begin seeding

  const media = await Promise.all([
    createMediaFromURL(
      payload,
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post1.webp',
      'Curving abstract shapes with an orange and blue gradient',
    ),
    createMediaFromURL(
      payload,
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post2.webp',
      'Curving abstract shapes with an orange and blue gradient',
    ),
    createMediaFromURL(
      payload,
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-post3.webp',
      'Curving abstract shapes with an orange and blue gradient',
    ),
    createMediaFromURL(
      payload,
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/main/templates/website/src/endpoints/seed/image-hero1.webp',
      'Curving abstract shapes with an orange and blue gradient',
    ),
  ])

  const { writer1, writer2 } = await createUsers(payload, media)

  const mediaDocs = media

  // Create articles for volumes
  const writers = [writer1, writer2]
  validateWriters(writers)

  const volume1Articles: number[] = []
  for (let i = 1; i <= 6; i++) {
    const writer = getWriterOrThrow(writers, i)
    const title = `Article ${i} - Volume 1`

    const article = await createArticle(payload, {
      title,
      content: createLoremIpsumContent(Math.floor(Math.random() * 8) + 3),
      authors: [writer.id],
      slug: `article-${i}-volume-1`,
      meta: {
        title,
        description: generateLoremIpsumParagraph(Math.floor(Math.random() * 2) + 1),
        image: mediaDocs[i % mediaDocs.length]?.id,
      },
    })
    volume1Articles.push(article.id)
  }

  const volume2Articles: number[] = []
  for (let i = 1; i <= 3; i++) {
    const writer = getWriterOrThrow(writers, i)
    const title = `Article ${i} - Volume 2`

    const article = await createArticle(payload, {
      title,
      content: createLoremIpsumContent(Math.floor(Math.random() * 8) + 3),
      authors: [writer.id],
      slug: `article-${i}-volume-2`,
      meta: {
        title,
        description: generateLoremIpsumParagraph(Math.floor(Math.random() * 2) + 1),
        image: mediaDocs[i % mediaDocs.length]?.id,
      },
    })
    volume2Articles.push(article.id)
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
    media,
  )

  // Create a standalone article demonstrating the footnotes feature
  await createFootnotesArticle(payload, [writer1, writer2], media, volume1Articles[0]!)

    // Create the media collage demo article
  await createMediaCollageArticle(payload, writer1, mediaDocs)

  // The homepage is literally a "page" in Payload.
  const homePage = await payload.create({
    collection: 'pages',
    data: homeStatic,
  })

  // Create pages for menus
  const { aboutPage, contactPage, privacyPolicyPage, termsOfUsePage } = await createPages(payload)

  await createMenus(payload, {
    homePage,
    aboutPage,
    contactPage,
    privacyPolicyPage,
    termsOfUsePage,
  })

  await createSocialEmbedArticle(payload, writer1)
  await createLegacySocialEmbedArticle(payload, writer1)
}
