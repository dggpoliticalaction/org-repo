import React from "react"

import type { PopulatedAuthors } from "@/payload-types"

import { AuthorCard } from "./AuthorCard"

export interface AuthorListProps extends React.HTMLAttributes<HTMLDivElement> {
  authors?: PopulatedAuthors
}

export const AuthorList: React.FC<AuthorListProps> = ({ authors, ...props }) => {
  if (!authors || !authors.length) return null

  return (
    <>
      <section aria-label="Authors" className="space-y-6" {...props}>
        <h3 className="text-xl font-bold">Meet the Author{authors.length > 1 ? "s" : ""}</h3>
        <div className="flex flex-col gap-4">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </section>
      {/* <Separator /> */}
    </>
  )
}
