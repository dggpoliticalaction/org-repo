import type { LinkField } from '@/payload-types'

export function getLinkFieldUrl(link?: LinkField): string | null {
  if (!link) return null
  if (
    link.type === 'reference' &&
    typeof link.reference?.value === 'object' &&
    link.reference?.value.slug
  ) {
    let url = ''
    if (link.reference?.relationTo !== 'pages') {
      url += `/${link.reference?.relationTo}`
    }

    url += `/${link.reference?.value.slug}`
    return url
  }
  return link.url || null
}
