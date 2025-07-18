import { type Article, type Volume } from '@/payload-types'
import { type CollectionBeforeChangeHook } from 'payload'

export const publishArticles: CollectionBeforeChangeHook<Volume> = async ({
  data,
  req: { payload },
}) => {
  // Automatically publish articles when a volume is published
  if (data._status === 'published' && data.articles) {
    // check if articles is an array of ids, then fetch the articles
    let articles: Article[] = []
    if (typeof data.articles[0] === 'number') {
      articles = await Promise.all(
        data.articles.map(
          async (articleId) =>
            await payload.findByID({
              collection: 'articles',
              id: articleId as number,
            }),
        ),
      )
    } else {
      articles = data.articles as Article[]
    }

    const articlesToPublish = articles.filter((article) => article._status !== 'published')

    if (articlesToPublish.length > 0) {
      // Update each article individually
      await Promise.all(
        articlesToPublish.map((article) =>
          payload.update({
            collection: 'articles',
            id: typeof article === 'object' ? article.id : article,
            data: {
              _status: 'published',
              publishedAt: new Date().toISOString(),
            },
          }),
        ),
      )
    }
  }
}
