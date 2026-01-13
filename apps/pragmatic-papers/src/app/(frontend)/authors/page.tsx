import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import type { Media, User } from '@/payload-types'
import { isWriter } from '@/access/checkRole'

import PageClient from './page.client'
import { authorSlugFromUser } from '@/utilities/authorSlug'

export const metadata: Metadata = {
  title: 'Authors — Pragmatic Papers',
  description: 'Discover all Pragmatic Papers authors and explore their published work.',
  openGraph: {
    title: 'Authors — Pragmatic Papers',
    description: 'Discover all Pragmatic Papers authors and explore their published work.',
    url: '/authors',
  },
}

async function queryAuthors(): Promise<User[]> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = (await payload.find({
    collection: 'users',
    draft,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    sort: 'name',
    depth: 1,
  })) as { docs: User[] }

  const docs = (result.docs || []) as User[]
  return docs.filter((user) => {
    if (!isWriter(user)) return false

    // Always include writers; for editor/chief-editor/admin require an explicit authorSlug
    if (user.role === 'writer') return true

    return Boolean(user.authorSlug)
  })
}

export default async function AuthorsIndexPage(): Promise<React.ReactNode> {
  const authors = await queryAuthors()

  return (
    <article className="m-auto max-w-3xl px-4 pb-16 pt-8">
      <PageClient />

      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Authors</h1>
        <p className="text-sm text-muted-foreground">
          Learn more about Pragmatic Papers contributors and explore their work.
        </p>
      </header>

      {authors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No authors available yet.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {authors.map((author) => {
            const slug = author.authorSlug || authorSlugFromUser(author)

            const profile = author.profileImage
            const profileDoc =
              profile && typeof profile === 'object' ? (profile as Media) : undefined
            const profileSrc = profileDoc?.sizes?.square?.url || profileDoc?.url || undefined

            return (
              <li
                key={author.id}
                className="flex flex-col items-center rounded-lg border bg-card p-4 text-center"
              >
                {profileSrc && (
                  <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border border-border">
                    <Image
                      src={profileSrc}
                      alt={profileDoc?.alt || author.name || author.email || 'Author avatar'}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Link
                  href={`/authors/${slug}`}
                  className="text-base font-semibold text-foreground transition-colors hover:text-brand"
                >
                  {author.name || author.email}
                </Link>
                {author.affiliation && (
                  <p className="mt-1 text-xs text-muted-foreground">{author.affiliation}</p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
