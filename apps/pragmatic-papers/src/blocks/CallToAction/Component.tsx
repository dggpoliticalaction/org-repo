import React from "react"

import type { CallToActionBlock as CTABlockProps } from "@/payload-types"

import { CMSLink } from "@/components/Link"
import { PaperIcon } from "@/components/Logo/icons/PaperIcon"
import { PaperIconPattern } from "@/components/Logo/icons/PaperIconPattern"
import RichText from "@/components/RichText"

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="container">
      <div className="from-brand to-brand/50 relative flex flex-col gap-8 rounded-sm border bg-linear-180 px-8 py-16 md:flex-row md:items-center md:justify-between">
        <PaperIconPattern className="absolute inset-0 h-full w-full opacity-5 blur-xs" />
        <div className="relative -mt-24 md:-mt-40">
          <PaperIcon className="absolute size-30 text-black/50 blur md:size-40" />
          <PaperIcon className="relative z-1 size-30 md:size-40" />
        </div>
        <div className="font-display relative mr-auto flex max-w-3xl items-center gap-6">
          {richText && (
            <RichText className="text-primary mb-0" data={richText} enableGutter={false} />
          )}
        </div>
        <div className="relative flex flex-col gap-8">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
