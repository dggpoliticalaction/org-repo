import type { Access } from 'payload'

export const canCreateComment: Access = async ({ req, data }): Promise<boolean> => {
  // Check if the article has comments enabled
  if (data?.article) {
    const articleId = typeof data.article === 'object' ? data.article.id : data.article

    try {
      const article = await req.payload.findByID({
        collection: 'articles',
        id: articleId,
        depth: 0,
      })

      // Anyone (including admins/editors) can comment if comments are enabled
      return !!article.commentsEnabled
    } catch (_error) {
      return false
    }
  }

  return false
}
