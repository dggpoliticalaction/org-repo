import type { Payload } from 'payload'
import type { Media, User } from '@/payload-types'

interface VolumeArticlesConfig {
  volumeNumber: number
  numberOfArticles: number
}

interface CreateArticlesResult {
  [key: string]: number[] // volumeId -> articleIds
}

const LOREM_IPSUMS = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur; yee wins.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
]
const SENTENCES_PER_PARAGRAPH = 5

const generateLoremIpsumParagraph = (numberOfSentences: number): string => {
  return Array.from({ length: numberOfSentences }, () => {
    return LOREM_IPSUMS[Math.floor(Math.random() * LOREM_IPSUMS.length)]
  }).join(' ')
}

const generateLoremIpsum = (numberOfParagraphs: number): string[] => {
  return Array.from({ length: numberOfParagraphs }, () =>
    generateLoremIpsumParagraph(SENTENCES_PER_PARAGRAPH),
  )
}

const createArticleContent = (numberOfParagraphs: number) => {
  const paragraphs = generateLoremIpsum(numberOfParagraphs)
  return {
    root: {
      type: 'root',
      children: Array.from({ length: numberOfParagraphs * 2 }, (_, index) => {
        return index % 2 === 0
          ? {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: paragraphs[Math.floor(index / 2)],
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '' as const,
              indent: 0,
              type: 'paragraph',
              version: 1,
            }
          : {
              children: [],
              direction: null,
              format: '' as const,
              indent: 0,
              type: 'paragraph',
              version: 1,
            }
      }),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export const createArticles = async (
  payload: Payload,
  writers: User[],
  volumeConfigs: VolumeArticlesConfig[],
  mediaDocs: Media[],
): Promise<CreateArticlesResult> => {
  if (writers.length === 0) {
    throw new Error('At least one writer is required to create articles')
  }

  const result: CreateArticlesResult = {}

  for (const config of volumeConfigs) {
    const volumeArticles: number[] = []

    for (let i = 1; i <= config.numberOfArticles; i++) {
      const writer = writers[i % writers.length]
      if (!writer?.id) {
        throw new Error(`Writer at index ${i % writers.length} has no ID`)
      }

      const article = await payload.create({
        collection: 'articles',
        data: {
          title: `Article ${i} - Volume ${config.volumeNumber}`,
          content: createArticleContent(Math.floor(Math.random() * 8) + 3),
          authors: [writer.id],
          _status: 'published',
          publishedAt: new Date().toISOString(),
          slug: `article-${i}-volume-${config.volumeNumber}`,
          meta: {
            title: `Article ${i} - Volume ${config.volumeNumber}`,
            description: generateLoremIpsumParagraph(Math.floor(Math.random() * 2) + 1),
            image: mediaDocs[i % mediaDocs.length]?.id,
          },
        },
      })
      volumeArticles.push(article.id)
    }

    result[`volume${config.volumeNumber}Articles`] = volumeArticles
  }

  return result
}
