// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { Article } from '@/payload-types'

/**
 * Formats an array of populatedAuthors from Articles into a prettified string.
 * @param authors - The populatedAuthors array from an Article.
 * @returns A prettified string of authors.
 * @example
 *
 * [Author1, Author2] becomes 'Author1 and Author2'
 * [Author1, Author2, Author3] becomes 'Author1, Author2, and Author3'
 *
 */
export const formatAuthors = (
  authors: NonNullable<NonNullable<Article['populatedAuthors']>[number]>[],
): string => {
  // Ensure we don't have any authors without a name
  const authorNames = authors.map((author) => author.name).filter(Boolean)

  if (authorNames.length === 0) return ''
  if (authorNames.length === 1) return authorNames[0] ?? ''
  if (authorNames.length === 2) return `${authorNames[0]} and ${authorNames[1]}`

  return `${authorNames.slice(0, -1).join(', ')} and ${authorNames[authorNames.length - 1]}`
}
