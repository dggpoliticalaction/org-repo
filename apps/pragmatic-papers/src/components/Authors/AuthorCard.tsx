import type { User } from "@/payload-types"
import React from "react"

import { AuthorLinks } from "@/components/Authors/AuthorLinks"
import { HoverPrefetchLink } from "@/components/Link/HoverPrefetchLink"
import { Media } from "@/components/Media"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() || ""
  return (parts[0]?.charAt(0) || "") + (parts[1]?.charAt(0) || "").toUpperCase()
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
  const profileImage = author.profileImage ?? undefined

  return (
    <Card className="rounded-xs">
        <HoverPrefetchLink href={`/authors/${slug}`} aria-label={name || "Author profile"}>
          <Avatar className="aspect-square h-24 w-24 hover:opacity-80">
          <Avatar className="aspect-square size-24 hover:opacity-80">
            <AvatarImage render={<Media media={profileImage} sizes="96px" variant="square" />} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </HoverPrefetchLink>
        <div className="flex flex-col justify-between space-y-2">
          <div className="flex-1 space-y-1">
            <div className="flex flex-col md:flex-row md:items-center">
              <HoverPrefetchLink
                href={`/authors/${slug}`}
                className="font-display text-primary hover:text-primary/80 text-lg font-bold"
              >
                {name}
              </HoverPrefetchLink>
              {affiliation && (
                <span className="text-muted-foreground ml-1 text-sm font-normal">
                  {" - "}
                <span className="text-muted-foreground ml-1 line-clamp-1 text-sm font-normal">
                  {affiliation}
                </span>
              )}
            </div>
            {bioSnippet && (
              <p className="text-primary line-clamp-2 font-serif text-sm">{bioSnippet}</p>
            )}
          </div>
          <AuthorLinks socials={author.socials} />
        </div>
      </CardContent>
    </Card>
  )
}
