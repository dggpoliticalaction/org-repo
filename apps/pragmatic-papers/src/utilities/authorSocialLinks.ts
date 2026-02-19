import type { User } from '@/payload-types'

export type SocialIconKey = 'twitter' | 'linkedin' | 'github' | 'generic'

export interface AuthorSocialLink {
  id: string
  href: string
  icon: SocialIconKey
  label?: string | null
}

export function normalizeExternalUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''

  // If the string already looks like it has a scheme, leave it as-is
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed

  // Otherwise, assume HTTPS and strip leading slashes
  return `https://${trimmed.replace(/^\/+/, '')}`
}

export function deriveAuthorSocialLinks(user: Pick<User, 'socialLinks'>): AuthorSocialLink[] {
  const entries = user.socialLinks || []
  const links: AuthorSocialLink[] = []

  for (const raw of entries) {
    const entry = raw as unknown as {
      id?: string | null
      link?: {
        type?: 'reference' | 'custom' | null
        url?: string | null
        label?: string | null
      } | null
    }

    const linkGroup = entry.link ?? undefined
    if (!linkGroup) continue

    if (linkGroup.type !== 'custom' || !linkGroup.url) continue

    const href = normalizeExternalUrl(linkGroup.url)
    if (!href) continue

    let host = ''
    try {
      const urlObj = new URL(href)
      host = urlObj.hostname.toLowerCase()
    } catch {
      // Non-HTTP(S) URL like mailto:, just treat as generic
    }

    let icon: SocialIconKey = 'generic'

    if (host.includes('twitter.com') || host.endsWith('x.com')) {
      icon = 'twitter'
    } else if (host.includes('linkedin.com')) {
      icon = 'linkedin'
    } else if (host.includes('github.com')) {
      icon = 'github'
    }

    links.push({
      id: entry.id || href,
      href,
      icon,
      label: linkGroup.label ?? null,
    })
  }

  return links
}
