import { type ButtonProps } from "@/components/ui/button"
import { cn } from "@/utilities/utils"
import Link from "next/link"
import React from "react"

import { LinkButton } from "@/components/ui/link-button"
import type { Article, Page, Volume } from "@/payload-types"

interface CMSLinkType {
  appearance?: "inline" | ButtonProps["variant"]
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: "pages" | "volumes" | "articles"
    value: Page | Volume | Article | string | number
  } | null
  size?: ButtonProps["size"] | null
  type?: "custom" | "reference" | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = "inline",
    children,
    className,
    label,
    newTab,
    reference,
    size,
    url,
  } = props

  const href =
    type === "reference" && typeof reference?.value === "object" && reference.value.slug
      ? `${reference?.relationTo !== "pages" ? `/${reference?.relationTo}` : ""}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: "noopener noreferrer", target: "_blank" } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === "inline") {
    return (
      <Link className={cn(className)} href={href || url || ""} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <LinkButton
      className={cn(className, appearance === "link" && "h-auto px-0 py-0")}
      size={size}
      variant={appearance}
      href={href || url || ""}
      {...newTabProps}
    >
      {label && label}
      {children && children}
    </LinkButton>
  )
}
