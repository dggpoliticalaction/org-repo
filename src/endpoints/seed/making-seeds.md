# Creating Seed Scripts for Articles and Features

Seed scripts populate the database with sample content for development. Rather than writing seeds by hand, use an AI assistant to generate them from article JSON exports.

## Quick Start

1. **Export your article** - Visit `localhost:8000/api/articles/{id}` to get the article JSON
2. **Feed it to an AI assistant** along with this documentation
3. **The AI will generate** a seed script using our utility functions

## Available Utility Functions

### Rich Text Utilities (`richtext.ts`)

**Basic Functions:**

- `createTextNode(text, format?)` - Creates a text node
- `createParagraph(text | textNode | array)` - Creates a paragraph with text/nodes
- `createEmptyParagraph()` - Creates a line break paragraph
- `createRichText(children)` - Wraps paragraph nodes in root structure

**High-Level Functions:**

- `createRichTextFromString(text)` - Single paragraph from string
- `createRichTextFromParagraphs(paragraphs[], addSpacing?)` - Multiple paragraphs with auto-spacing
- `createLoremIpsumContent(numParagraphs)` - Lorem ipsum for testing

**Lorem Ipsum Generators:**

- `generateLoremIpsumParagraph(numSentences)` - Single paragraph
- `generateLoremIpsumParagraphs(numParagraphs)` - Array of paragraphs

### Media Utilities (`media.ts`)

- `fetchFileByURL(url)` - Fetches a file from URL, returns Payload File object
- `createMediaFromURL(payload, url, alt, additionalData?)` - Fetches and creates media in one call
  - `additionalData` supports: `{ caption: LexicalContent }`

### Article Utilities (`articles.ts`)

- `createArticle(payload, options)` - Creates a published article with defaults

```typescript
interface CreateArticleOptions {
  title: string
  content: LexicalContent
  authors: number[]
  slug: string
  meta?: {
    title?: string | null
    description?: string | null
    image?: number | null
  }
}
```

- `validateWriters(writers)` - Throws if no writers provided
- `getWriterOrThrow(writers, index)` - Gets writer by index with validation

### Block Helpers (in feature files)

**Media Blocks:**

```typescript
createMediaBlock(mediaId) // Single image block
```

**Media Collage Blocks:**

```typescript
createMediaCollageBlock(mediaIds[], layout) // 'grid' or 'carousel'
```

## How to Generate a Seed from Article JSON

When generating a seed from article JSON:

1. **Analyze the content structure** - Identify paragraphs, blocks, media, and any special content types
2. **Identify media requirements** - Note all media used in the article
3. **Request external URLs from the user** - The JSON contains local dev server URLs (e.g., `/api/media/file/...`) which won't work in seed scripts
   - List all media items with their alt text and captions
   - Request publicly accessible URLs for each (CDN, GitHub raw, image hosting services, etc.)
   - Wait for user to provide URLs before proceeding
4. **Replace hardcoded IDs** - Use function parameters for media/author IDs instead of JSON IDs
5. **Build content programmatically** - Use utility functions, don't copy raw JSON structure
6. **Create helper functions** - Extract repeated block patterns into reusable functions
7. **Follow existing patterns** - Reference `features/footnotes.ts` or `features/media-collage.ts` as examples

### Important: Media URLs

⚠️ **Do NOT use URLs from article JSON** (e.g., `/api/media/file/image.jpg`) - these point to the local development server and won't work in seed scripts.

**Instead:**

- Ask the user to provide external URLs for each media item
- Use publicly accessible URLs (CDN, GitHub raw, image hosting services, etc.)
- Example: `https://raw.githubusercontent.com/org/repo/main/image.jpg`

## Seed File Structure

```typescript
import type { Payload } from 'payload'
import type { User, Media } from '@/payload-types'
import { createMediaFromURL } from '../utils/media'
import {
  createRichText,
  createParagraph,
  createTextNode,
  createEmptyParagraph,
} from '../utils/richtext'
import { createArticle } from '../utils/articles'

// Helper functions for custom blocks
function createMyCustomBlock(data) {
  return {
    type: 'block',
    fields: { blockType: 'myBlock', ...data },
    format: '',
    version: 2,
  }
}

export const createMyFeatureArticle = async (
  payload: Payload,
  writer: User,
  mediaDocs: Media[],
): Promise<number> => {
  // Create any additional media
  const customMedia = await createMediaFromURL(
    payload,
    'https://example.com/image.jpg',
    'Alt text',
    { caption: createRichTextFromString('Caption text') },
  )

  // Build content programmatically
  const content = createRichText([
    createParagraph('Introduction paragraph'),
    createEmptyParagraph(),
    createMyCustomBlock({
      /* data */
    }),
    createParagraph([
      createTextNode('Text with '),
      {
        type: 'inlineBlock',
        fields: {
          /* inline block data */
        },
      },
      createTextNode(' more text'),
    ]),
  ])

  // Create the article
  const article = await createArticle(payload, {
    title: 'My Feature Demo',
    content,
    authors: [writer.id],
    slug: 'my-feature-demo',
    meta: {
      description: 'Description of the feature',
      image: mediaDocs[0]?.id,
    },
  })

  return article.id
}
```

## Example: Converting JSON to Seed

**Given article JSON with:**

- Title: "Example Article"
- Content with paragraphs and media blocks
- Media with captions (showing local URLs like `/api/media/file/...`)

**AI should first ask:**

> "I see this article uses 2 media items. The JSON shows local dev server URLs which won't work for seeding. Please provide external URLs for:
>
> 1. Media with alt text 'alt1' and caption 'Caption 1'
> 2. Media with alt text 'alt2' and caption 'Caption 2'"

**Then AI generates:**

```typescript
export const createExampleArticle = async (payload, writer, mediaDocs) => {
  // Create media with captions (using external URLs provided by user)
  const [media1, media2] = await Promise.all([
    createMediaFromURL(
      payload,
      'https://example.com/images/image1.jpg', // External URL from user
      'alt1',
      { caption: createRichTextFromString('Caption 1') },
    ),
    createMediaFromURL(
      payload,
      'https://cdn.example.com/image2.png', // External URL from user
      'alt2',
      { caption: createRichTextFromString('Caption 2') },
    ),
  ])

  // Build content
  const content = createRichText([
    createParagraph('First paragraph from JSON'),
    createEmptyParagraph(),
    createMediaBlock(media1.id),
    createEmptyParagraph(),
    createParagraph('Second paragraph from JSON'),
  ])

  // Create article
  return await createArticle(payload, {
    title: 'Example Article',
    content,
    authors: [writer.id],
    slug: 'example-article',
    meta: { description: 'Example description', image: media1.id },
  })
}
```

## Tips for AI Assistants

- **Never copy raw JSON** - Always use utility functions
- **ASK for external media URLs** - DO NOT use URLs from JSON (they're local dev server paths)
- Parse the JSON to identify all media items (check alt text, captions)
- Ask user: "Please provide external URLs for [list media with descriptions]"
- Wait for user to provide URLs before generating the seed
- **Build content incrementally** using `createParagraph()` and helpers
- **Create helper functions** for repeated block patterns
- **Handle inline blocks** (footnotes, etc.) as objects in paragraph children arrays
- **Use TypeScript types** from `@/payload-types` for type safety
- **Match existing patterns** - Look at `features/footnotes.ts` or `features/media-collage.ts` as examples

## Registering New Seeds

Add your seed to `index.ts`:

```typescript
import { createMyFeatureArticle } from './features/my-feature'

// In the seed() function:
await createMyFeatureArticle(payload, writer1, mediaDocs)
```
