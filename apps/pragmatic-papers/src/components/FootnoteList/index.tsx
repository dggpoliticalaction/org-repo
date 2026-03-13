import { CMSLink } from "@/components/Link/CMSLink2"
import type { FootnotesField } from "@/payload-types"
import { getLinkFieldUrl } from "@/utilities/getLinkFieldUrl"
import { getClientSideURL } from "@/utilities/getURL"
import React from "react"

interface FootnoteListProps {
  footnotes?: FootnotesField
}

export const FootnoteList: React.FC<FootnoteListProps> = ({ footnotes }) => {
  if (!footnotes || !footnotes.length) return null
  return (
    <section className="border-border mt-4 border-t pt-4">
      <h3 className="text-xl font-semibold">Footnotes</h3>
      <ol className="list-inside list-decimal">
        {footnotes.map(({ index, note, attributionEnabled, link }) => {
          const url = getLinkFieldUrl(link)
          return (
            <li key={index}>
              <span id={`footnote-${index}`} className="mr-2">
                {note}
              </span>
              {attributionEnabled && (
                <CMSLink link={link} className="text-brand underline shadow-none">
                  {link?.type === "reference" ? `${getClientSideURL()}${url}` : url}
                </CMSLink>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
