// Placeholder posts - easy to swap out later by changing the data source
export interface PlaceholderPost {
  id: string
  title: string
  slug: string
  excerpt: string
  createdAt: string
}

export const getPlaceholderPosts = (): PlaceholderPost[] => {
  return [
    {
      id: '1',
      title: 'Sed pulvinar odio',
      slug: 'placeholder-1',
      excerpt: 'Sed pulvinar odio sed tellus vehicula, eget suscipit risus aliquam.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Sed pulvinar odio',
      slug: 'placeholder-2',
      excerpt: 'Sed pulvinar odio sed tellus vehicula, eget suscipit risus aliquam.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Sed pulvinar odio',
      slug: 'placeholder-3',
      excerpt: 'Sed pulvinar odio sed tellus vehicula, eget suscipit risus aliquam.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '4',
      title: 'Sed pulvinar odio',
      slug: 'placeholder-4',
      excerpt: 'Sed pulvinar odio sed tellus vehicula, eget suscipit risus aliquam.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '5',
      title: 'Sed pulvinar odio',
      slug: 'placeholder-5',
      excerpt: 'Sed pulvinar odio sed tellus vehicula, eget suscipit risus aliquam.',
      createdAt: new Date().toISOString(),
    },
    {
      id: '6',
      title: 'Sed pulvinar odio',
      slug: 'placeholder-6',
      excerpt: 'Sed pulvinar odio sed tellus vehicula, eget suscipit risus aliquam.',
      createdAt: new Date().toISOString(),
    },
  ]
}

// Future: Replace this with actual Payload collection fetch
// Example of how to swap to real data:
// 
// import { getPayload } from 'payload'
// import configPromise from '@payload-config'
// 
// export const getPosts = async () => {
//   const payload = await getPayload({ config: configPromise })
//   const posts = await payload.find({
//     collection: 'posts', // or 'events' or whatever collection you create
//     limit: 10,
//     sort: '-createdAt',
//     where: {
//       _status: {
//         equals: 'published',
//       },
//     },
//   })
//   return posts.docs.map(post => ({
//     id: post.id,
//     title: post.title,
//     slug: post.slug,
//     excerpt: post.meta?.description || '',
//     createdAt: post.createdAt,
//   }))
// }