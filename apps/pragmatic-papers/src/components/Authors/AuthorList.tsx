import React from 'react'

import type { User } from '@/payload-types'

import { AuthorCard } from './AuthorCard'

export interface AuthorListProps {
  authors: User[]
}

export const AuthorList: React.FC<AuthorListProps> = ({ authors }) => {
  if (!authors.length) return null

  return (
    <div className="flex flex-col gap-4">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} />
      ))}
    </div>
  )
}
