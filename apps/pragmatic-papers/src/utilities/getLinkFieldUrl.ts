import type { LinkField } from '@/payload-types'

export const getLinkFieldUrl = (link?: LinkField): string | null => {
  if (!link) return null
  if (
    link.type === 'reference' &&
    typeof link.reference?.value === 'object' &&
    link.reference?.value.slug
  ) {
    return `${link.reference?.relationTo !== 'pages' ? `/${link.reference?.relationTo}` : ''}/${link.reference?.value.slug}`
  }
  return link.url || null
}
