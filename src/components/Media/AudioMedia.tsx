import { type Media } from "@/payload-types"
import { PlayCircle } from "lucide-react"
import React from "react"

export interface AudioMediaProps {
  className?: string
  media: Media & { mimeType: `audio/${string}` }
}

export function AudioMedia({ className }: AudioMediaProps): React.ReactNode {
  return (
    <div className={className}>
      <PlayCircle className="size-4" />
      <span className="sr-only">Play</span>
    </div>
  )
}
