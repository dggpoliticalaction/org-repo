"use client"

import { Fragment, type ReactElement } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useSelectedLayoutSegments } from "next/navigation"

const formatBreadcrumbLabel = (segment: string): string => {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const Breadcrumbs = (): ReactElement | null => {
  const segments = useSelectedLayoutSegments()

  if (segments.length === 0) return null

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...segments.map((segment, index) => ({
      label: formatBreadcrumbLabel(segment),
      href: "/" + segments.slice(0, index + 1).join("/"),
    })),
  ]

  return (
    <Breadcrumb className="container mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
