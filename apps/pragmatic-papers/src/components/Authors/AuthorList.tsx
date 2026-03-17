import React from "react"

import type { User } from "@/payload-types"

import { AuthorCard } from "@/components/Authors/AuthorCard"
import { Separator } from "@/components/ui/separator"

export interface AuthorListProps extends React.HTMLAttributes<HTMLDivElement> {
  authors: (number | User)[] | null | undefined
}

export const AuthorList: React.FC<AuthorListProps> = ({ authors, ...props }) => {
  if (!authors || !authors.length) return null
  const filteredAuthors = (authors || []).filter((author) => typeof author === "object")
  if (!filteredAuthors.length) return null

  return (
    <>
      <section aria-label="Authors" className="space-y-6" {...props}>
        <h3 className="text-xl font-bold">
          Meet the Author{filteredAuthors.length > 1 ? "s" : ""}
        </h3>
        <div className="flex flex-col gap-4">
          {filteredAuthors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      </section>
      <Separator />
    </>
  )
}
