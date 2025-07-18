import type { RequiredDataFromCollectionSlug } from 'payload'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  title: 'Home',
  hero: {
    type: 'lowImpact',
    richText: null,
    links: [],
    media: null,
  },
  layout: [
    {
      introContent: null,
      populateBy: 'collection',
      relationTo: 'volumes',
      limit: 6,
      blockName: null,
      blockType: 'volumeView',
      selectedDocs: [],
    },
  ],
  meta: {
    title: null,
    image: null,
    description: null,
  },
  publishedAt: '2025-07-09T07:54:37.358Z',
  slug: 'home',
  slugLock: true,
  updatedAt: '2025-07-13T23:32:37.273Z',
  createdAt: '2025-07-09T07:54:36.604Z',
  _status: 'published',
}
