"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/utilities/utils"

interface TimelineEvent {
  date: string
  description: string
}

interface TimelineProps {
  events: TimelineEvent[]
  variant?: "vertical" | "horizontal"
  className?: string
}

const MAX_NODES_VERTICAL = 15
const MAX_NODES_HORIZONTAL = 13
const MAX_DESCRIPTION_CHARS_VERTICAL = 500
const MAX_DESCRIPTION_CHARS_HORIZONTAL = 100

const truncateDescription = (text: string, maxChars: number): string => {
  if (text.length > maxChars) {
    return text.slice(0, maxChars - 3) + "..."
  }
  return text
}

export const Timeline: React.FC<TimelineProps> = ({ events, variant = "vertical", className }) => {
  const [currentPage, setCurrentPage] = useState(0)
  const leftArrowRef = useRef<HTMLButtonElement>(null)
  const rightArrowRef = useRef<HTMLButtonElement>(null)

  // Enforce max nodes based on variant
  const maxNodes = variant === "horizontal" ? MAX_NODES_HORIZONTAL : MAX_NODES_VERTICAL

  useEffect(() => {
    if (events.length > maxNodes) {
      console.warn(
        `Timeline: ${events.length} events exceed max of ${maxNodes} for ${variant} variant. Only showing ${maxNodes}.`,
      )
    }
    if (variant === "horizontal" && events.length < 5) {
      console.warn(
        `Timeline: horizontal variant requires at least 5 events, but only ${events.length} provided.`,
      )
    }
  }, [events.length, maxNodes, variant])

  // Slice events and truncate descriptions
  const maxDescriptionChars =
    variant === "horizontal" ? MAX_DESCRIPTION_CHARS_HORIZONTAL : MAX_DESCRIPTION_CHARS_VERTICAL
  const validEvents = events.slice(0, maxNodes).map((event) => ({
    ...event,
    description: truncateDescription(event.description, maxDescriptionChars),
  }))

  if (variant === "horizontal") {
    const CARD_WIDTH = 200
    const VISIBLE_EVENTS = 5
    const totalPages = Math.max(1, events.length - VISIBLE_EVENTS + 1)
    const visiblePages = Array.from({ length: totalPages }, (_, i) => i)

    const handleScroll = (direction: "left" | "right", isKeyboard: boolean) => {
      const newPage =
        direction === "left"
          ? Math.max(0, currentPage - 1)
          : Math.min(totalPages - 1, currentPage + 1)
      setCurrentPage(newPage)
      if (isKeyboard) {
        if (direction === "right" && newPage === totalPages - 1) {
          leftArrowRef.current?.focus({ preventScroll: true })
        } else if (direction === "left" && newPage === 0) {
          rightArrowRef.current?.focus({ preventScroll: true })
        }
      }
    }

    return (
      <div className={cn("w-full", className)}>
        <div
          className="group relative mx-auto overflow-hidden"
          style={{ maxWidth: `${VISIBLE_EVENTS * CARD_WIDTH}px` }}
        >
          {/* Left arrow */}
          <button
            ref={leftArrowRef}
            onClick={(e) => {
              if (e.detail > 0) {
                handleScroll("left", false)
                e.currentTarget.blur()
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleScroll("left", true)
              }
            }}
            tabIndex={currentPage === 0 ? -1 : 0}
            className={cn(
              "absolute top-1/2 left-0 z-20 -translate-y-1/2 cursor-pointer transition-opacity duration-200",
              currentPage === 0
                ? "pointer-events-none opacity-0"
                : "opacity-0 group-hover:opacity-100 focus:opacity-100",
            )}
            aria-label="Scroll left"
          >
            <div className="bg-foreground/10 hover:bg-foreground/20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
          </button>

          {/* Right arrow */}
          <button
            ref={rightArrowRef}
            onClick={(e) => {
              if (e.detail > 0) {
                handleScroll("right", false)
                e.currentTarget.blur()
              }
            }}
            onMouseDown={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                handleScroll("right", true)
              }
            }}
            tabIndex={currentPage === totalPages - 1 ? -1 : 0}
            className={cn(
              "absolute top-1/2 right-0 z-20 -translate-y-1/2 cursor-pointer transition-opacity duration-200",
              currentPage === totalPages - 1
                ? "pointer-events-none opacity-0"
                : "opacity-0 group-hover:opacity-100 focus:opacity-100",
            )}
            aria-label="Scroll right"
          >
            <div className="bg-foreground/10 hover:bg-foreground/20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-foreground"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>

          <div
            className="relative inline-flex"
            style={{
              paddingTop: "140px",
              paddingBottom: "140px",
              transform: `translateX(-${currentPage * CARD_WIDTH}px)`,
              transition: "transform 300ms ease-in-out",
            }}
          >
            {/* Horizontal line */}
            <div className="bg-border absolute right-0 left-0 h-px" style={{ top: "50%" }} />

            {/* Events */}
            {validEvents.map((event, index) => {
              const isTop = index % 2 === 0
              const dotColor = index % 2 === 0 ? "var(--brand)" : "var(--foreground)"

              return (
                <div
                  key={`${event.date}-${index}`}
                  className="relative flex w-[200px] flex-shrink-0 flex-col items-center"
                >
                  {isTop && (
                    <div
                      className="absolute text-center"
                      style={{
                        bottom: "100%",
                        marginBottom: "24px",
                        maxWidth: "160px",
                        overflowWrap: "break-word",
                      }}
                    >
                      <div className="text-foreground font-mono text-xs font-bold tracking-wide uppercase">
                        {event.date}
                      </div>
                      <p className="text-muted-foreground mt-1 font-sans text-xs">
                        {event.description}
                      </p>
                    </div>
                  )}

                  {/* Dot on the line */}
                  <div
                    className="z-10 h-3 w-3 rounded-full"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: dotColor,
                    }}
                  />

                  {!isTop && (
                    <div
                      className="absolute text-center"
                      style={{
                        top: "100%",
                        marginTop: "24px",
                        maxWidth: "160px",
                        overflowWrap: "break-word",
                      }}
                    >
                      <div className="text-foreground font-mono text-xs font-bold tracking-wide uppercase">
                        {event.date}
                      </div>
                      <p className="text-muted-foreground mt-1 font-sans text-xs">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pagination dots */}
        {totalPages > 1 && (
          <div className="flex min-h-[60px] items-center justify-center gap-2">
            {visiblePages.map((page) => {
              const isActive = currentPage === page
              return (
                <button
                  key={`indicator-${page}`}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    isActive ? "bg-foreground" : "bg-foreground/40 hover:bg-foreground/60",
                  )}
                  style={{
                    width: isActive ? "12px" : "8px",
                    height: isActive ? "12px" : "8px",
                    cursor: "pointer",
                  }}
                  aria-label={`Go to page ${page + 1}`}
                />
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Vertical layout
  return (
    <div className={cn("relative w-full", className)}>
      {/* Center vertical line (desktop only) */}
      <div className="bg-border absolute top-0 left-1/2 hidden h-full w-px -translate-x-1/2 md:block" />

      {validEvents.map((event, index) => {
        const isLeft = index % 2 === 0
        const dotColor = isLeft ? "var(--brand)" : "var(--foreground)"

        return (
          <div key={`${event.date}-${index}`} className="relative mb-16">
            {/* Desktop: left side */}
            {isLeft && (
              <div className="hidden md:flex md:items-start md:justify-center md:gap-8">
                <div className="w-1/2 pr-8 text-right">
                  <div className="text-foreground font-mono text-sm font-bold tracking-wide uppercase">
                    {event.date}
                  </div>
                  <p className="text-muted-foreground mt-2 ml-auto max-w-[280px] font-sans text-sm">
                    {event.description}
                  </p>
                </div>
                <div
                  className="absolute top-1 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                <div className="w-1/2" />
              </div>
            )}

            {/* Desktop: right side */}
            {!isLeft && (
              <div className="hidden md:flex md:items-start md:justify-center md:gap-8">
                <div className="w-1/2" />
                <div
                  className="absolute top-1 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
                <div className="w-1/2 pl-8 text-left">
                  <div className="text-foreground font-mono text-sm font-bold tracking-wide uppercase">
                    {event.date}
                  </div>
                  <p className="text-muted-foreground mt-2 max-w-[280px] font-sans text-sm">
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile: single column */}
            <div className="flex items-start gap-4 md:hidden">
              <div
                className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: dotColor }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-foreground font-mono text-sm font-bold tracking-wide uppercase">
                  {event.date}
                </div>
                <p className="text-muted-foreground mt-2 font-sans text-sm">{event.description}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
