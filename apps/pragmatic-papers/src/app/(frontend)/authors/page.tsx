import { AuthorList } from '@/components/Authors/AuthorList'
import type { User } from '@/payload-types'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

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

  const { docs } = await payload.find({
    collection: 'users',
    draft,
    limit: 1000,
    pagination: false,
    sort: 'name',
    depth: 1,
    where: {
      role: {
        in: ['writer', 'editor', 'chief-editor'],
      },
    },
  })

  return docs
}

export default async function AuthorsIndexPage(): Promise<React.ReactNode> {
  const authors = await queryAuthors()

  return (
    <article className="m-auto max-w-3xl px-4 pb-16 pt-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Authors</h1>
        <p className="text-sm text-muted-foreground">
          Learn more about Pragmatic Papers contributors and explore their work.
        </p>
      </header>

      {authors.length === 0 ? (
        <p className="text-sm text-muted-foreground">No authors available yet.</p>
      ) : (
        <AuthorList authors={authors} />
      )}
    </article>
  )
}
