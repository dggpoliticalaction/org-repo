import type { FootnoteBlock as FootnoteBlockType } from "@/payload-types"
import { cn } from "@/utilities/utils"
import Link from "next/link"
import React from "react"

interface FootnoteBlockProps extends FootnoteBlockType {
  className?: string
}

export const FootnoteBlock: React.FC<FootnoteBlockProps> = ({ note, index, className }) => {
  if (!note || typeof index !== "number") return null

  const referenceId = `footnote-ref-${index}`
  const describedById = `footnote-${index}`

  return (
    <sup
      id={referenceId}
      className={cn(className, "not-prose px-0.5 font-mono -tracking-widest")}
      title={`Footnote ${index}: ${note}`}
    >
      <Link
        className="text-brand/80 hover:text-brand border-none font-bold"
        href={`#${describedById}`}
        aria-describedby={describedById}
      >
        {`[${index}]`}
      </Link>
    </sup>
  )
}
