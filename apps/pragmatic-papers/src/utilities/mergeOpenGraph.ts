import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Pragmatic, community-driven articles focusing on new, politics, economics and more.',
  images: [
    {
      url: `${getServerSideURL()}/pragmaticpapers-logo-dark-og.png`,
    },
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
