import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { fetchFileByURL } from '../../media'
import articleData from './article.json'
    
export const createMediaCollageArticle = async (
  payload: Payload,
  writer: User,
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
  const mediaIdMap: Record<number, number> = {
    11: itsBadMedia.id,
    12: blueCoatMedia.id,
  }

  // Process the content and replace media IDs
  const processedContent = JSON.parse(JSON.stringify(articleData.content))
  
  // Process blocks in content to replace media IDs
  if (processedContent.root?.children) {
    processedContent.root.children = processedContent.root.children.map((child: any) => {
      if (child.type === 'block' && child.fields?.blockType === 'mediaCollage') {
        return {
          ...child,
          fields: {
            ...child.fields,
            images: child.fields.images?.map((img: any) => ({
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
        image: articleData.meta?.image?.id ? mediaIdMap[articleData.meta.image.id] : undefined,
      },
    },
  })

  return article.id
}
