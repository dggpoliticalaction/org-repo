import type { LinkField } from '@/payload-types'
import { getLinkFieldUrl } from '@/utilities/getLinkFieldUrl'
import Link from 'next/link'

interface CMSLink2Props extends React.ComponentProps<'a'> {
  link?: LinkField
}

// Planning to replace the CMSLink component with this one in the future.
// Need to add appearance handling before replacing. Use class-variance-authority for handling sizes and variants.
export const CMSLink: React.FC<CMSLink2Props> = ({ link, children, ...props }) => {
  if (!link) return null
  const url = getLinkFieldUrl(link)
  if (!url) return null
  return (
    <>
      {link.type === 'custom' && (
        <a
          href={url}
          className="text-brand underline shadow-none"
          target={link?.newTab ? '_blank' : undefined}
          rel={link?.newTab ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children || link?.label}
        </a>
      )}
      {link.type === 'reference' && (
        <Link
          href={url}
          className="text-brand underline shadow-none"
          target={link?.newTab ? '_blank' : undefined}
          rel={link?.newTab ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children || link?.label}
        </Link>
      )}
    </>
  )
}
