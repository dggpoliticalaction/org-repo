import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Pragmatic, community-driven articles focusing on new, politics, economics and more.',
  images: [
    // TODO: Add default image
    // {
    // url: `${getServerSideURL()}/website-template-OG.webp`,
    // },
  ],
  siteName: 'Pragmatic Papers',
  title: 'Pragmatic Papers',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
