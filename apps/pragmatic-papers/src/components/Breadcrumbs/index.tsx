"use client"

import { Fragment, type ReactElement } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSelectedLayoutSegments } from "next/navigation"
import { ChevronDown } from "lucide-react"

const SECTION_DROPDOWN_LINKS = [
  { href: "/articles", label: "Articles" },
  { href: "/topics", label: "Topics" },
  { href: "/volumes", label: "Volumes" },
  { href: "/authors", label: "Authors" },
] as const

const CURRENT_PAGE_CLASS = "block min-w-0 max-w-full truncate"
const DROPDOWN_TRIGGER_CLASS = "flex items-center gap-1 capitalize"
const DROPDOWN_CONTENT_CLASS = "w-max min-w-36"

const formatBreadcrumbLabel = (segment: string): string => {
  return decodeURIComponent(segment)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const getSegmentHref = (segments: string[], index: number): string =>
  `/${segments.slice(0, index + 1).join("/")}`

const getSegmentItems = (segments: string[]) =>
  segments.map((segment, index) => ({
    href: getSegmentHref(segments, index),
    label: formatBreadcrumbLabel(segment),
  }))

const getDropdownLinks = (label: string) =>
  SECTION_DROPDOWN_LINKS.filter((link) => link.label !== label)

export const Breadcrumbs = (): ReactElement | null => {
  const segments = useSelectedLayoutSegments()

  if (segments.length === 0) return null

  const segmentItems = getSegmentItems(segments)
  const lastSegmentIndex = segmentItems.length - 1

  return (
    <Breadcrumb className="container mb-4">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>

        {segmentItems.map(({ href, label }, index) => {
          const dropdownLinks = getDropdownLinks(label)
          const isCurrentPage = index === lastSegmentIndex
          const isOnlySegment = segmentItems.length === 1

          return (
            <Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className={isCurrentPage ? "min-w-0 flex-1" : undefined}>
                {index === 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={`${DROPDOWN_TRIGGER_CLASS}${isOnlySegment ? "w-full min-w-0" : ""}`}
                    >
                      {segmentItems.length > 1 ? (
                        <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage className={CURRENT_PAGE_CLASS}>{label}</BreadcrumbPage>
                      )}
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className={DROPDOWN_CONTENT_CLASS}>
                      {dropdownLinks.map((link) => (
                        <DropdownMenuItem key={link.href}>
                          <a href={link.href}>{link.label}</a>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : isCurrentPage ? (
                  <BreadcrumbPage className={CURRENT_PAGE_CLASS}>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
