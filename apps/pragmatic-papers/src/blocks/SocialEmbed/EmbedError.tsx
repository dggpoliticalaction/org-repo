import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, TriangleAlert } from "lucide-react"

interface EmbedErrorProps {
  url: string
  message: string
  platform: string
}

export function EmbedError({
  url,
  message,
  platform
}: EmbedErrorProps): React.ReactNode {
  return (
    <Card className="max-w-[550px] mx-auto my-4 bg-muted/50 text-muted-foreground/50 text-center text-sm">
      <CardContent className="flex flex-col items-center pt-4">
        <TriangleAlert className="w-8 h-8" />
        <p>{message}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline shadow-none inline-flex items-center gap-1"
        >
          <span>
            Click to view on {platform}
          </span>
          <ExternalLink className="w-4 h-4 inline-block" />
        </a>
      </CardContent>
    </Card>
  )
}