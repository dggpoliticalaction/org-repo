import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React from 'react'

import type { Author as AuthorType, Media as MediaType } from '@/payload-types'

import PageClient from './page.client'
import { Media } from '@/components/Media'

interface AuthorListDoc {
  id: string | number
  name?: AuthorType['name'] | null
  slug?: AuthorType['slug'] | null
  affiliation?: AuthorType['affiliation']
  biography?: AuthorType['biography']
  profileImage?: AuthorType['profileImage']
}

export const metadata: Metadata = {
  title: 'Authors — Pragmatic Papers',
  description: 'Discover all Pragmatic Papers authors and explore their published work.',
  openGraph: {
    title: 'Authors — Pragmatic Papers',
    description: 'Discover all Pragmatic Papers authors and explore their published work.',
    url: '/authors',
  },
}

async function queryAuthors(): Promise<AuthorListDoc[]> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = (await payload.find({
    collection: 'authors',
    draft,
    limit: 1000,
    overrideAccess: draft,
    pagination: false,
    sort: 'name',
  })) as { docs: AuthorListDoc[] }

  return result.docs || []
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
          {authors.map((author) => (
            <li
              key={author.id}
              className="flex flex-col items-center rounded-lg border bg-card p-4 text-center"
            >
              {!!author.profileImage && typeof author.profileImage === 'object' && (
                <div className="mb-3 h-20 w-20 overflow-hidden rounded-full border border-border">
                  <Media
                    resource={author.profileImage as MediaType}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover"
                    size="square"
                  />
                </div>
              )}
              {author.slug ? (
                <a
                  href={`/authors/${author.slug}`}
                  className="text-base font-semibold text-foreground transition-colors hover:text-brand"
                >
                  {author.name}
                </a>
              ) : (
                <p className="text-base font-semibold">{author.name}</p>
              )}
              {author.affiliation && (
                <p className="mt-1 text-xs text-muted-foreground">{author.affiliation}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
