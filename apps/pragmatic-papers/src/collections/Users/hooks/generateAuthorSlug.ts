import type { User } from '@/payload-types'
import { authorSlugFromNameAndId } from '@/utilities/authorSlug'
import type { CollectionBeforeChangeHook } from 'payload'

export const generateAuthorSlug: CollectionBeforeChangeHook<User> = ({ data }) => {
  // Admin accounts should never have an author slug exposed
  if (data.role === 'admin') {
    data.authorSlug = null
  }

  // Only auto-generate an author slug for writers; for other roles
  // (chief-editor, editor, user) the slug should be explicitly set.
  if (data.role === 'writer') {
    if (!data.authorSlug || typeof data.authorSlug !== 'string') {
      const slug = authorSlugFromNameAndId(
        (data.name as string | null | undefined) ?? null,
        (data.id as number | null | undefined) ?? null,
      )
      data.authorSlug = slug
    }
  }

  return data
}
