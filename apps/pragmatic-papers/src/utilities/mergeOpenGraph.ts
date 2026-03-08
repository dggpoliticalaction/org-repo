import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Pragmatic, community-driven articles focusing on news, politics, economics, and more.',
  images: [
    {
      url: `${getServerSideURL()}/the-pragmatic-papers-opengraph-image.png`,
    },
  ],
  siteName: 'The Pragmatic Papers',
  title: 'The Pragmatic Papers',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
