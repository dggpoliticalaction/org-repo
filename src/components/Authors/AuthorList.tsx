import React from "react"

import type { PopulatedAuthors } from "@/payload-types"

import { AuthorCard } from "@/components/Authors/AuthorCard"

export interface AuthorListProps extends React.HTMLAttributes<HTMLDivElement> {
  authors?: PopulatedAuthors
}

export const AuthorList: React.FC<AuthorListProps> = ({ authors, ...props }) => {
  if (!authors || !authors.length) return null

  return (
    <section aria-label="Authors" className="space-y-3" {...props}>
      <h2>Meet the Author{authors.length > 1 ? "s" : ""}</h2>
      <div className="flex flex-col gap-4">
        {authors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>
    </section>
  )
}
