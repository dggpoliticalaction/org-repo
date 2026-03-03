import React from 'react'

import type { User } from '@/payload-types'

import { AuthorCard } from './AuthorCard'

export interface AuthorListProps extends React.HTMLAttributes<HTMLDivElement> {
  authors: (number | User)[] | null | undefined
}

export const AuthorList: React.FC<AuthorListProps> = ({ authors, ...props }) => {
  if (!authors || !authors.length) return null

  const filteredAuthors = (authors || []).filter((author) => typeof author === 'object')

  return (
    <section aria-label="Authors" className="mt-10 border-t pt-8" {...props}>
      <h2 className="mb-4 text-xl font-semibold">
        Meet the Author{filteredAuthors.length > 1 ? 's' : ''}
      </h2>
      <div className="flex flex-col gap-4">
        {filteredAuthors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </section>
  )
}
