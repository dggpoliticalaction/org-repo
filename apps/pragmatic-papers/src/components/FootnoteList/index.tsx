import type { FootnoteBlock } from '@/payload-types'
import Link from 'next/link'

interface FootnoteListProps {
  footnotes?: Pick<FootnoteBlock, 'index' | 'note' | 'attributionEnabled' | 'link'>[] | null
}

export const FootnoteList: React.FC<FootnoteListProps> = ({ footnotes }) => {
  if (!footnotes || !footnotes.length) return null
  return (
    <section className="mt-4 border-t border-border pt-4">
      <h3 className="text-xl font-bold">Footnotes</h3>
      <ol className="list-decimal pl-4">
        {footnotes.map(({ index, note, attributionEnabled, link }) => {
          return (
            <li key={index}>
              <span id={`footnote-${index}`} className="mr-2">
                {note}
              </span>
              {attributionEnabled && link && link.url && link.type === 'custom' && (
                <a
                  href={link.url}
                  className="border-none text-brand underline shadow-none"
                  title={`Link to source ${link.label}`}
                >
                  {link.url}
                </a>
              )}
              {attributionEnabled && link && link.url && link.type === 'reference' && (
                <Link
                  href={`/${link.reference?.relationTo}/${typeof link.reference?.value !== 'number' ? link.reference?.value?.slug : link.reference?.value}`}
                  className="border-none text-brand underline shadow-none"
                  title={`Link to source ${link.label}`}
                >
                  {link.url}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
