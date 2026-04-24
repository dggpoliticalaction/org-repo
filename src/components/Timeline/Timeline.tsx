import { CMSLink } from "@/components/Link/CMSLink2"
import { ImageMedia } from "@/components/Media/ImageMedia"
import { getLinkFieldUrl } from "@/utilities/getLinkFieldUrl"
import { cn } from "@/utilities/utils"

import { Separator } from "@/components/ui/separator"
import { TimelineEventReveal } from "./TimelineEventReveal"
import type { TimelineAvatar, TimelineBaseProps, TimelineEvent } from "./types"

const Citation: React.FC<Pick<TimelineEvent, "date" | "enableCitation" | "citation">> = ({
  date,
  enableCitation,
  citation,
}) => {
  if (!enableCitation || !citation || !getLinkFieldUrl(citation)) return null
  return (
    <sup className="relative top-[0.25px] ml-[2.5px] align-super">
      <CMSLink
        link={citation}
        className="text-brand hover:text-foreground text-[0.65em] font-semibold transition-colors"
        aria-label={`Citation for ${date}`}
      >
        [1]
      </CMSLink>
    </sup>
  )
}

const EventContent: React.FC<{
  event: TimelineEvent
  textAlign?: "left" | "right"
}> = ({ event, textAlign = "left" }) => (
  <>
    <div className="text-brand text-sm font-bold tracking-wide">
      {new Date(event.date).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </div>
    {event.title && <div className="text-foreground font-sans">{event.title}</div>}
    <p
      className={cn(
        "text-muted-foreground mt-2 max-w-[280px] font-sans text-sm",
        textAlign === "right" && "ml-auto",
      )}
    >
      {event.description}
      <Citation date={event.date} enableCitation={event.enableCitation} citation={event.citation} />
    </p>
  </>
)

const Avatar: React.FC<{ media: TimelineAvatar }> = ({ media }) => (
  <ImageMedia
    media={media}
    variant="thumbnail"
    sizes="64px"
    className="h-16 w-16 shrink-0 rounded-full object-cover"
  />
)

export const Timeline: React.FC<TimelineBaseProps> = ({ events, title, className }) => {
  return (
    <div className={cn("w-full", className)}>
      {title && (
        <div className="text-muted-foreground mb-4 text-center font-mono text-xs font-semibold tracking-widest uppercase">
          {title}
        </div>
      )}
      <Separator />
      <div className="relative w-full">
        <Separator
          orientation="vertical"
          className="absolute top-0 left-1/2 hidden h-full -translate-x-1/2 md:block"
        />
        {events.map((event, index) => {
          const isLeft = index % 2 === 0
          const dotColor = isLeft ? "bg-brand" : "bg-foreground"
          const avatar = typeof event.avatar === "object" ? event.avatar : null
          return (
            <TimelineEventReveal key={index} className="relative mb-16">
              <div className="hidden md:flex md:items-center md:justify-center md:gap-8">
                <div
                  className={cn(
                    "flex w-1/2 items-center gap-4",
                    isLeft ? "justify-end pr-8 text-right" : "justify-start pl-8 text-left",
                  )}
                >
                  {avatar && <Avatar media={avatar} />}
                  <div className={cn("flex flex-col", !isLeft && "order-first")}>
                    <EventContent event={event} textAlign={isLeft ? "right" : "left"} />
                  </div>
                </div>
                <div
                  className={cn(
                    "absolute top-1 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full",
                    dotColor,
                  )}
                />
                <div className={cn("w-1/2", !isLeft && "order-first")} />
              </div>

              <div className="flex items-start gap-4 md:hidden">
                <div className={cn("mt-1 h-3 w-3 shrink-0 rounded-full", dotColor)} />
                <div className="min-w-0 flex-1">
                  <EventContent event={event} />
                </div>
              </div>
            </TimelineEventReveal>
          )
        })}
      </div>
    </div>
  )
}
