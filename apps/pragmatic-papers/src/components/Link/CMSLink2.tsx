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
  const sharedProps = {
    className: 'text-brand underline shadow-none',
    target: link?.newTab ? '_blank' : undefined,
    rel: link?.newTab ? 'noopener noreferrer' : undefined,
    ...props,
  }
  const content = children || link?.label

  return link.type === 'custom' ? (
    <a href={url} {...sharedProps}>
      {content}
    </a>
  ) : (
    <Link href={url} {...sharedProps}>
      {content}
    </Link>
  )
}
