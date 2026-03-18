import type { Article, User } from "@/payload-types"
import type { CollectionAfterReadHook } from "payload"

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook<Article> = async ({
  doc,
  req: { payload },
}) => {
  if (!doc.authors || !doc.authors.length) return doc

  const populatedAuthors: User[] = []

  for (const author of doc.authors) {
    try {
      const authorDoc = await payload.findByID({
        id: typeof author === "number" ? author : author?.id,
        collection: "users",
        overrideAccess: true,
        depth: 1,
      })

      if (authorDoc) {
        populatedAuthors.push(authorDoc)
      }
    } catch {
      // swallow error
    }
  }

  if (populatedAuthors.length > 0) {
    doc.populatedAuthors = populatedAuthors.map((populatedAuthor) => ({
      id: populatedAuthor.id as unknown as string,
      name: populatedAuthor.name,
      slug: populatedAuthor.slug,
      affiliation: populatedAuthor.affiliation,
      biography: populatedAuthor.biography,
      profileImage: populatedAuthor.profileImage,
      socials: populatedAuthor.socials,
    }))
  }

  return doc
}
