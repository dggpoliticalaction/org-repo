import type { Media, User } from '@/payload-types'
import type { Payload } from 'payload'

const createArticleContentWithFootnotes = (referencedArticleId: number) => {
  return {
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
              text: 'This article demonstrates the footnotes feature. Footnotes are useful for providing additional context, citations, and references.',
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
        {
          children: [],
          direction: null,
          format: '' as const,
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Academic writing often requires citations to support claims and provide readers with sources for further reading',
              type: 'text',
              version: 1,
            },
            {
              type: 'inlineBlock',
              fields: {
                blockType: 'footnote',
                note: 'This is a basic footnote without attribution. It provides additional context or explanation for the preceding text.',
                attributionEnabled: false,
              },
              format: '',
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '. Footnotes can be inserted anywhere in the text where additional information is needed.',
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
        {
          children: [],
          direction: null,
          format: '' as const,
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'The footnotes feature also supports attribution links, which can point to external sources or internal references',
              type: 'text',
              version: 1,
            },
            {
              type: 'inlineBlock',
              fields: {
                blockType: 'footnote',
                note: 'This footnote includes an attribution link to demonstrate the full capabilities of the footnotes feature.',
                attributionEnabled: true,
                link: {
                  type: 'custom',
                  url: 'https://en.wikipedia.org/wiki/Footnote',
                  label: 'Wikipedia - Footnote',
                  newTab: true,
                },
              },
              format: '',
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: '. This makes it easy to cite sources and provide readers with direct access to referenced materials.',
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
        {
          children: [],
          direction: null,
          format: '' as const,
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Multiple footnotes can be used throughout a document',
              type: 'text',
              version: 1,
            },
            {
              type: 'inlineBlock',
              fields: {
                blockType: 'footnote',
                note: 'Footnotes are automatically numbered sequentially as they appear in the document.',
                attributionEnabled: false,
              },
              format: '',
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: ', and they are automatically numbered in the order they appear. This makes it easy to reference specific notes when discussing complex topics.',
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
        {
          children: [],
          direction: null,
          format: '' as const,
          indent: 0,
          type: 'paragraph',
          version: 1,
        },
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'The footnote system integrates seamlessly with the Lexical rich text editor, allowing authors to insert footnotes inline while writing. Footnotes appear as numbered references in the text',
              type: 'text',
              version: 1,
            },
            {
              type: 'inlineBlock',
              fields: {
                blockType: 'footnote',
                note: 'This is another example footnote with attribution to show how multiple footnotes work together in a single document.',
                attributionEnabled: true,
                link: {
                  type: 'custom',
                  url: 'https://www.lexical.dev/',
                  label: 'Lexical Editor',
                  newTab: true,
                },
              },
              format: '',
              version: 1,
            },
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: ', and clicking on them scrolls to the full footnote text at the bottom of the article.',
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
        ...(referencedArticleId
          ? [
              {
                children: [],
                direction: null,
                format: '' as const,
                indent: 0,
                type: 'paragraph',
                version: 1,
              },
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Footnotes can also link to internal references, such as other articles in the collection',
                    type: 'text',
                    version: 1,
                  },
                  {
                    type: 'inlineBlock',
                    fields: {
                      blockType: 'footnote',
                      note: 'This footnote demonstrates a reference link to another article, showing how footnotes can connect related content within the site.',
                      attributionEnabled: true,
                      link: {
                        type: 'reference',
                        reference: {
                          relationTo: 'articles',
                          value: referencedArticleId,
                        },
                        label: 'Article 1 - Volume 1',
                        newTab: false,
                      },
                    },
                    format: '',
                    version: 1,
                  },
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: '. This creates a network of interconnected content that enhances the reading experience.',
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
            ]
          : []),
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}

export const createFootnotesArticle = async (
  payload: Payload,
  writers: User[],
  mediaDocs: Media[],
  referencedArticleId: number,
): Promise<number> => {
  if (writers.length === 0) {
    throw new Error('At least one writer is required to create articles')
  }

  const writer = writers[0]
  if (!writer?.id) {
    throw new Error('Writer has no ID')
  }

  const article = await payload.create({
    collection: 'articles',
    data: {
      title: 'Demonstrating Footnotes: A Comprehensive Guide',
      content: createArticleContentWithFootnotes(referencedArticleId),
      authors: [writer.id],
      _status: 'published',
      publishedAt: new Date().toISOString(),
      slug: 'demonstrating-footnotes-comprehensive-guide',
      meta: {
        title: 'Demonstrating Footnotes: A Comprehensive Guide',
        description:
          'This article demonstrates the footnotes feature, showing how to add citations, references, and additional context to your articles.',
        image: mediaDocs[0]?.id,
      },
    },
  })

  return article.id
}
