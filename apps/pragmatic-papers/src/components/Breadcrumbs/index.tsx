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

export const Breadcrumbs = (): ReactElement | null => {
  const segments = useSelectedLayoutSegments()

  if (segments.length === 0) return null

  const breadcrumbs = [
    { label: "Home", href: "/" },
    ...segments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: "/" + segments.slice(0, index + 1).join("/"),
    })),
  ]

  return (
    <Breadcrumb className="container mb-4">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={breadcrumb.href}>
            <BreadcrumbItem>
              <BreadcrumbLink href={breadcrumb.href}>{breadcrumb.label}</BreadcrumbLink>
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
