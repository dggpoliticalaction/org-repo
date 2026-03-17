import type { PopulatedAuthors } from "@/payload-types"
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext"
import Link from "next/link"
import React from "react"

import { AuthorLinks } from "@/components/Authors/AuthorLinks"
import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { Card, CardContent } from "@/components/ui/card"

type Author = NonNullable<PopulatedAuthors>[number]

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || ""
  return (parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "").toUpperCase()
}

function extractBioSnippet(author: Author, maxLength = 255): string | undefined {
  if (!author.biography) return
  const text = convertLexicalToPlaintext({ data: author.biography })
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text
}

export interface AuthorCardProps {
  author: NonNullable<PopulatedAuthors>[number]
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const { slug, name, affiliation } = author
  const initials = getInitials(name || "Author")
  const bioSnippet = extractBioSnippet(author)
  const profileDoc = author.profileImage

  return (
    <Card className="rounded-sm">
      <CardContent className="flex flex-row gap-4 p-4">
        <HoverPrefetchLink href={`/authors/${slug}`} aria-label={name || "Author profile"}>
          <div className="border-border bg-muted h-24 w-24 overflow-hidden rounded-sm border">
            {profileDoc ? (
              <Media
                media={profileDoc}
                className="hover:opacity-80"
                sizes="96px"
                variant="square"
              />
            ) : (
              <div className="bg-primary text-primary-foreground flex h-full w-full items-center justify-center text-lg font-semibold">
                {initials}
              </div>
            )}
          </div>
        </HoverPrefetchLink>
        <div className="flex h-24 flex-1 flex-col justify-between overflow-hidden">
          <div className="min-h-0 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-foreground font-semibold">
                  <Link href={`/authors/${slug}`} className="hover:text-brand transition-colors">
                    {name}
                  </Link>
                  {affiliation && (
                    <span className="text-muted-foreground ml-1 text-sm font-normal">
                      {" - "}
                      {affiliation}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            {bioSnippet && (
              <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{bioSnippet}</p>
            )}
          </div>
          <AuthorLinks socials={author.socials} />
        </div>
      </CardContent>
    </Card>
  )
}
