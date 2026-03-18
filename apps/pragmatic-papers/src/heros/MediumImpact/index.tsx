import React from "react"

import type { Page } from "@/payload-types"

import { CMSLink } from "@/components/Link"
import { Media } from "@/components/Media"
import RichText from "@/components/RichText"

export const MediumImpactHero: React.FC<Page["hero"]> = ({ links, media, richText }) => {
  return (
    <div className="">
      <div className="container mb-8">
        {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}

        {Array.isArray(links) && links.length > 0 && (
          <ul className="flex gap-4">
            {links.map(({ link }, i) => {
              return (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {media && typeof media === "object" && (
        <div>
          <Media
            media={media}
            sizes="100vw"
            variant="large"
            priority
          />
          {media?.caption && (
            <div className="container mt-3">
              <RichText data={media.caption} enableGutter={false} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
