import type { Payload } from 'payload'
import type { User, Media } from '@/payload-types'
import { fetchFileByURL } from '../../media'
import articleData from './article.json'
    
export const createMediaCollageArticle = async (
  payload: Payload,
  writer: User,
  mediaDocs: Media[],
): Promise<number> => {
  // Fetch the two images with captions
  const [itsBadBuffer, blueCoatBuffer] = await Promise.all([
    fetchFileByURL('https://wikicdn.destiny.gg/f/fd/ITSBAD.png'),
    fetchFileByURL('https://wikicdn.destiny.gg/6/64/BlueCoat.jpg'),
  ])

  // Create media with captions
  const itsBadMedia = await payload.create({
    collection: 'media',
    data: {
      alt: "It's bad, what do you want me to say!",
      caption: {
        root: {
          type: 'root',
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: "It's bad, what do you want me to say!",
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '' as const,
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      },
    },
    file: itsBadBuffer,
  })

  const blueCoatMedia = await payload.create({
    collection: 'media',
    data: {
      alt: 'A snazzy blue jacket',
      caption: {
        root: {
          type: 'root',
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'A snazzy blue jacket',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr' as const,
              format: '' as const,
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          version: 1,
        },
      },
    },
    file: blueCoatBuffer,
  })

  // Map media IDs from the exported article
  // mediaDocs order: [image-post1, image-post2, image-post3, image-hero1]
  // Old IDs in JSON: 7 = image-post1, 8 = image-post3, 9 = image-post2, 10 = image-hero1
  const mediaIdMap: Record<number, number> = {
    7: mediaDocs[0]?.id ?? 0,  // image-post1
    8: mediaDocs[2]?.id ?? 0,  // image-post3
    9: mediaDocs[1]?.id ?? 0,  // image-post2
    10: mediaDocs[3]?.id ?? 0, // image-hero1
    11: itsBadMedia.id,
    12: blueCoatMedia.id,
  }

  // Process the content and replace media IDs
  const processedContent = JSON.parse(JSON.stringify(articleData.content))
  
  // Process blocks in content to replace media IDs
  if (processedContent.root?.children) {
    processedContent.root.children = processedContent.root.children.map((child: Record<string, unknown>) => {
      if (child.type === 'block' && child.fields?.blockType === 'mediaCollage') {
        return {
          ...child,
          fields: {
            ...child.fields,
            images: child.fields.images?.map((img: Record<string, unknown>) => ({
              ...img,
              media: img.media?.id ? mediaIdMap[img.media.id] || img.media.id : img.media,
            })),
          },
        }
      }
      if (child.type === 'block' && child.fields?.blockType === 'mediaBlock') {
        return {
          ...child,
          fields: {
            ...child.fields,
            media: child.fields.media?.id ? mediaIdMap[child.fields.media.id] || child.fields.media.id : child.fields.media,
          },
        }
      }
      return child
    })
  }

  // Create the article using the exported structure
  const article = await payload.create({
    collection: 'articles',
    data: {
      title: articleData.title,
      content: processedContent,
      authors: [writer.id],
      _status: 'published',
      publishedAt: new Date().toISOString(),
      slug: articleData.slug,
      meta: {
        title: articleData.meta?.title || articleData.title,
        description: articleData.meta?.description,
        image: undefined,
      },
    },
  })

  return article.id
}
