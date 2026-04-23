import type { LinkField, Media } from "@/payload-types"

export type TimelineAvatar = Media

export interface TimelineEvent {
  date: string
  title?: string | null
  description: string
  avatar?: TimelineAvatar | number | null
  enableCitation?: boolean | null
  citation?: LinkField | null
}

export interface TimelineBaseProps {
  events: TimelineEvent[]
  title?: string | null
  className?: string
}
