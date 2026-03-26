import { normalizeExternalUrl } from "@/components/Authors/AuthorLinks"
import type { MenuField } from "@/payload-types"
import { cn } from "@/utilities/utils"
import { Globe } from "lucide-react"
import type { FC, SVGProps } from "react"
import { detectSocialLinkPlatform, type SocialLinkPlatform } from "./detectPlatform"
import {
  BlueskyIcon,
  InstagramIcon,
  RedditIcon,
  SubstackIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from "./icons"

type SocialIconKey = SocialLinkPlatform | "generic"

const iconMap: Record<SocialIconKey, FC<SVGProps<SVGSVGElement>>> = {
  twitter: XIcon,
  instagram: InstagramIcon,
  reddit: RedditIcon,
  bluesky: BlueskyIcon,
  substack: SubstackIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  generic: Globe,
}

interface SocialLinksProps {
  className?: string
  socials?: MenuField
}

export function SocialLinks({ className, socials }: SocialLinksProps): React.ReactElement | null {
  if (!socials?.length) return null

  const links = socials.flatMap(({ link, id }) => {
    if (link?.type !== "custom" || !link.url) return []
    const href = normalizeExternalUrl(link.url)
    if (!href) return []
    const platform: SocialIconKey = detectSocialLinkPlatform(href) ?? "generic"
    return [{ id: id || href, href, platform, label: link.label }]
  })

  if (!links.length) return null

  return (
    <nav aria-label="Social Links" className={cn("flex flex-row items-center gap-2", className)}>
      {links.map(({ id, href, platform, label }) => {
        const Icon = iconMap[platform] ?? Globe
        return (
          <a
            key={id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title={label || href}
          >
            <span className="sr-only">{label || href}</span>
            <Icon className="size-4" />
          </a>
        )
      })}
    </nav>
  )
}
