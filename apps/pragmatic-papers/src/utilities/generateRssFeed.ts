import { Feed } from 'feed'
import { type Article, type Media, type Volume } from '../payload-types'
import { getServerSideURL } from './getURL'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

const SITE_URL = getServerSideURL()

const getMediaUrl = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${SITE_URL}${url}`
}

const formatArticleLink = (article: Article) => {
  if (!article.meta?.description) {
    return `<li style="margin: 1em 0"><a href="${SITE_URL}/articles/${article.slug}">${article.title}</a></li>`
  }

  return `
<li style="margin: 1em 0">
  <a href="${SITE_URL}/articles/${article.slug}">${article.title}</a>
  <p style="margin: 0.5em 0 0 0; color: #666">${article.meta.description}</p>
</li>`
}

const formatVolumeDescription = (volume: Volume) => {
  const sections = []

  if (volume.description) {
    sections.push(`<div style="margin-bottom: 1.5em">${volume.description}</div>`)
  }

  if (volume.editorsNote) {
    sections.push(`
<div style="margin: 1.5em 0">
  ${convertLexicalToHTML({ data: volume.editorsNote })}
</div>`)
  }

  const articles = volume.articles
    ?.map((articleRef) => {
      if (typeof articleRef === 'string') return ''
      return formatArticleLink(articleRef as Article)
    })
    .filter(Boolean)
    .join('\n')

  if (articles) {
    sections.push(`
<div style="margin-top: 1.5em">
  <h3>Articles in this Volume</h3>
  <ul style="padding-left: 1.5em">
    ${articles}
  </ul>
</div>`)
  }

  return sections.join('\n')
}

const createBaseFeedConfig = (type: 'Articles' | 'Volumes') => ({
  title: `Pragmatic Papers - ${type}`,
  description: `Latest ${type.toLowerCase()} from Pragmatic Papers`,
  id: SITE_URL,
  link: SITE_URL,
  language: 'en',
  favicon: `${SITE_URL}/favicon.ico`,
  image: `${SITE_URL}/pragmaticpapers-logo-dark-og.png`,
  copyright: `All rights reserved ${new Date().getFullYear()}`,
  generator: 'Pragmatic Papers',
  updated: new Date(),
  feedLinks: {
    rss2: `${SITE_URL}/feed.${type.toLowerCase()}/route.xml`,
    atom: `${SITE_URL}/feed.${type.toLowerCase()}/route.xml`,
  },
})

export const generateArticleFeed = (articles: Article[]): string => {
  const feed = new Feed(createBaseFeedConfig('Articles'))

  articles.forEach((article) => {
    if (article._status === 'published' && article.publishedAt) {
      feed.addItem({
        title: article.title,
        id: `${SITE_URL}/articles/${article.slug}`,
        link: `${SITE_URL}/articles/${article.slug}`,
        description: article.meta?.description ? article.meta.description : '',
        date: new Date(article.publishedAt),
        image:
          article.meta?.image && typeof article.meta.image !== 'string'
            ? getMediaUrl((article.meta.image as Media).url ?? '')
            : undefined,
        author: article.populatedAuthors?.map((author) => ({
          name: author.name || '',
        })),
      })
    }
  })

  return feed.rss2()
}

export const generateVolumeFeed = (volumes: Volume[]): string => {
  const feed = new Feed(createBaseFeedConfig('Volumes'))

  volumes.forEach((volume) => {
    if (volume._status === 'published' && volume.publishedAt) {
      feed.addItem({
        title: volume.title,
        id: `${SITE_URL}/volumes/${volume.slug}`,
        link: `${SITE_URL}/volumes/${volume.slug}`,
        description: formatVolumeDescription(volume),
        date: new Date(volume.publishedAt),
        image:
          volume.meta?.image && typeof volume.meta.image !== 'string'
            ? `${SITE_URL}${(volume.meta.image as Media).url}`
            : undefined,
      })
    }
  })

  return feed.rss2()
}
