import type { RequiredDataFromCollectionSlug } from 'payload'

// Used as a pre-seed fallback so that the homepage is not empty before the DB is seeded.
// The actual seeded home page (with ArticleGrid blocks) is created by
// `features/article-grid.ts` — this static version is intentionally minimal.
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  title: 'Home',
  hero: {
    type: 'pageHero',
    richText: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Welcome to Pragmatic Papers',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr' as const,
            format: '' as const,
            indent: 0,
            type: 'paragraph',
            version: 1,
            textFormat: 0,
            textStyle: '',
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    links: [],
    media: null,
  },
  layout: [],
  meta: {
    title: null,
    image: null,
    description: null,
  },
  publishedAt: '2025-07-09T07:54:37.358Z',
  slug: 'home',
  generateSlug: true,
  updatedAt: '2025-07-13T23:32:37.273Z',
  createdAt: '2025-07-09T07:54:36.604Z',
  _status: 'published',
}
