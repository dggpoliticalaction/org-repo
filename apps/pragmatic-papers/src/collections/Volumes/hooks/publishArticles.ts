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
        (
          await payload.find({
            collection: 'articles',
            where: {
              id: { in: data.articles as number[] },
            },
          })
        ).docs,
      )
    } else {
      articles = data.articles as Article[]
    }

    const articlesToPublish = articles.filter((article) => article._status !== 'published')

    if (articlesToPublish.length > 0) {
      await payload.update({
        collection: 'articles',
        where: {
          id: {
            in: articlesToPublish.map((article) =>
              typeof article === 'object' ? article.id : article,
            ),
          },
        },
        data: {
          _status: 'published',
          publishedAt: new Date().toISOString(),
        },
      })
    }
  }
}
