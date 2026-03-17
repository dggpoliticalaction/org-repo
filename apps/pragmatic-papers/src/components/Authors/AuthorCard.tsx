import { Media } from "@/components/Media"
import { Card, CardContent } from "@/components/ui/card"
import type { Media as MediaType, User } from "@/payload-types"
import Link from "next/link"
import React from "react"
import { HoverPrefetchLink } from "../Link/HoverPrefetchLink"
import { AuthorLinks } from "./AuthorLinks"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || ""
  return (parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "").toUpperCase()
}

function extractProfileDoc(author: User): MediaType | undefined {
  const profile = author.profileImage
  return profile && typeof profile === "object" ? (profile as MediaType) : undefined
}

function extractBioSnippet(author: User, maxLength = 255): string | undefined {
  const bio = author.biography as User["biography"] | string
  if (!bio) return undefined

  if (typeof bio === "string") {
    const clean = bio.trim().replace(/\s+/g, " ")
    if (!clean) return undefined
    return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean
  }

  const root = bio.root
  if (!root || !Array.isArray(root.children)) return undefined

  let text = ""

  for (const block of root.children) {
    if (!block || typeof block !== "object" || !Array.isArray(block.children)) continue
    for (const child of block.children) {
      if (child && typeof child === "object" && typeof child.text === "string") {
        text += child.text + " "
      }
    }
  }

  const clean = text.trim().replace(/\s+/g, " ")
  if (!clean) return undefined

  return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean
}

export interface AuthorCardProps {
  author: User
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author }) => {
  const { slug, name, affiliation } = author
  const initials = getInitials(name || "Author")
  const bioSnippet = extractBioSnippet(author)
  const profileDoc = extractProfileDoc(author)

  return (
    <Card className="rounded-sm">
      <CardContent className="flex flex-row gap-4 p-4">
        <HoverPrefetchLink href={`/authors/${slug}`} aria-label={name || "Author profile"}>
          <div className="h-24 w-24 overflow-hidden rounded-sm border border-border bg-muted">
            {profileDoc ? (
              <Media
                media={profileDoc}
                className="hover:opacity-80"
                sizes="96px"
                variant="square"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary text-lg font-semibold text-primary-foreground">
                {initials}
              </div>
            )}
          </div>
        </HoverPrefetchLink>
        <div className="flex h-24 flex-1 flex-col justify-between overflow-hidden">
          <div className="min-h-0 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  <Link href={`/authors/${slug}`} className="transition-colors hover:text-brand">
                    {name}
                  </Link>
                  {affiliation && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {" - "}
                      {affiliation}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            {bioSnippet && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{bioSnippet}</p>
            )}
          </div>
          <AuthorLinks socials={author.socials} />
        </div>
      </CardContent>
    </Card>
  )
}
