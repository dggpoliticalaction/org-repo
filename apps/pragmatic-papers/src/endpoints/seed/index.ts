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

  const volume1Titles = [
    'The Trolley Problem Revisited: Moral Intuition in the Age of Autonomous Vehicles',
    'Free Will and Determinism: Can Neuroscience Settle the Debate?',
    'Plato\'s Cave in the Digital Age: Social Media as Manufactured Reality',
    'The Ship of Theseus and Personal Identity: Who Are You After a Decade?',
    'Simone de Beauvoir\'s Ethics of Ambiguity and the Modern Workplace',
    'Epistemic Injustice: Why Some Voices Are Silenced in Public Discourse',
  ]

  const volume2Titles = [
    'Dawkins vs. Blackmore: What Counts as a Meme in the Attention Economy?',
    'Irony as Ideology: How the Internet Weaponised Humour',
    'The Half-Life of Virality: Why Memes Die and What Survives',
  ]

  const volume1Articles: number[] = []
  for (let i = 0; i < volume1Titles.length; i++) {
    const writer = getWriterOrThrow(writers, i)
    const title = volume1Titles[i]!
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const article = await createArticle(payload, {
      title,
      content: createLoremIpsumContent(Math.floor(Math.random() * 8) + 3),
      authors: [writer.id],
      slug,
      meta: {
        title,
        description: generateLoremIpsumParagraph(Math.floor(Math.random() * 2) + 1),
        image: mediaDocs[i % mediaDocs.length]?.id,
      },
    })
    volume1Articles.push(article.id)
  }

  const volume2Articles: number[] = []
  for (let i = 0; i < volume2Titles.length; i++) {
    const writer = getWriterOrThrow(writers, i)
    const title = volume2Titles[i]!
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    const article = await createArticle(payload, {
      title,
      content: createLoremIpsumContent(Math.floor(Math.random() * 8) + 3),
      authors: [writer.id],
      slug,
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
  const {
    aboutPage,
    articlesPage,
    contactPage,
    privacyPolicyPage,
    termsOfUsePage,
    volumesPage,
  } = await createPages(payload)

  await createMenus(payload, {
    homePage,
    aboutPage,
    articlesPage,
    contactPage,
    privacyPolicyPage,
    termsOfUsePage,
    volumesPage,
  })

  await createSocialEmbedArticle(payload, writer1, mediaDocs)
  await createLegacySocialEmbedArticle(payload, writer1, mediaDocs)
}
