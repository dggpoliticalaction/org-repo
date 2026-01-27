import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Github, Globe, Linkedin, Twitter } from 'lucide-react'

import type { Media, User } from '@/payload-types'
import { Card, CardContent } from '@/components/ui/card'
import { authorSlugFromUser } from '@/utilities/authorSlug'

function normalizeExternalUrl(url: string): string {
  const trimmed = url.trim()
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return trimmed
  return `https://${trimmed.replace(/^\/+/, '')}`
}

function getInitials(name: string): string {
  const value = name.trim()
  if (!value) return ''

  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    const single = parts[0] ?? ''
    if (!single) return ''
    return single.slice(0, 2).toUpperCase()
  }

  const first = parts[0] ?? ''
  const second = parts[1] ?? ''
  if (!first && !second) return ''
  const chars = `${first[0] ?? ''}${second[0] ?? ''}`
  return chars.toUpperCase()
}

function extractProfileImage(author: User): { src?: string; alt: string } {
  const profile = author.profileImage
  const profileDoc = profile && typeof profile === 'object' ? (profile as Media) : undefined
  const src = profileDoc?.sizes?.square?.url || profileDoc?.url || undefined
  const alt = profileDoc?.alt || author.name || 'Author avatar'

  return { src, alt }
}

function extractBioSnippet(author: User, maxLength = 255): string | undefined {
  const bio = author.biography as any
  if (!bio) return undefined

  if (typeof bio === 'string') {
    const clean = bio.trim().replace(/\s+/g, ' ')
    if (!clean) return undefined
    return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean
  }

  const root = bio.root
  if (!root || !Array.isArray(root.children)) return undefined

  let text = ''

  for (const block of root.children) {
    if (!block || typeof block !== 'object' || !Array.isArray(block.children)) continue
    for (const child of block.children) {
      if (child && typeof child === 'object' && typeof child.text === 'string') {
        text += child.text + ' '
      }
    }
  }

  const clean = text.trim().replace(/\s+/g, ' ')
  if (!clean) return undefined

  return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean
}

function deriveSocialLinks(author: User): {
  twitter?: string
  linkedin?: string
  github?: string
  website?: string
} {
  const result: {
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
  } = {}

  const entries = author.socialLinks || []

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

    let host = ''
    try {
      const urlObj = new URL(href)
      host = urlObj.hostname.toLowerCase()
    } catch {
      // Non-HTTP(S) URL like mailto:, just treat as website
    }

    const label = (linkGroup.label || '').toLowerCase()

    if (!result.twitter && (host.includes('twitter.com') || label.includes('twitter'))) {
      result.twitter = href
      continue
    }

    if (!result.linkedin && (host.includes('linkedin.com') || label.includes('linkedin'))) {
      result.linkedin = href
      continue
    }

    if (!result.github && (host.includes('github.com') || label.includes('github'))) {
      result.github = href
      continue
    }

    if (!result.website && (label.includes('site') || label.includes('website') || !host)) {
      result.website = href
      continue
    }

    if (!result.website) {
      result.website = href
    }
  }

  return result
}

export interface AuthorCardProps {
  author: User
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const slug = author.authorSlug || authorSlugFromUser(author)
  const name = author.name || 'Author'
  const title = author.affiliation || undefined

  const { src: avatarUrl, alt } = extractProfileImage(author)
  const initials = getInitials(name)

  const bioSnippet = extractBioSnippet(author)

  const socialLinks = deriveSocialLinks(author)
  const hasSocialLinks = Boolean(
    socialLinks.twitter || socialLinks.linkedin || socialLinks.github || socialLinks.website,
  )

  return (
    <Card>
      <CardContent className="flex flex-row gap-4 p-4">
        <Link href={`/authors/${slug}`} aria-label={name || 'Author profile'}>
          <div className="h-24 w-24 overflow-hidden rounded-sm border border-border bg-muted">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={alt}
                width={96}
                height={96}
                className="h-full w-full object-cover transition-opacity hover:opacity-80"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </div>
            )}
          </div>
        </Link>
        <div className="flex h-24 flex-1 flex-col justify-between overflow-hidden">
          <div className="min-h-0 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  <Link href={`/authors/${slug}`} className="transition-colors hover:text-brand">
                    {name}
                  </Link>
                  {title && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {' - '}
                      {title}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            {bioSnippet && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bioSnippet}</p>
            )}
          </div>
          {hasSocialLinks && (
            <div className="mt-1 flex flex-row gap-3">
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`${name} on Twitter`}
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`${name} on LinkedIn`}
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`${name} on GitHub`}
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {socialLinks.website && (
                <a
                  href={socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={`${name}'s website`}
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
