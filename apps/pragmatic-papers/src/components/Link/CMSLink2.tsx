import type { LinkField } from '@/payload-types'
import { getLinkFieldUrl } from '@/utilities/getLinkFieldUrl'
import { HoverPrefetchLink } from './HoverPrefetchLink'

interface CMSLinkProps extends React.ComponentProps<'a'> {
  link?: LinkField
}

// Planning to replace the CMSLink component with this one in the future.
// Need to add appearance handling before replacing. Use class-variance-authority for handling sizes and variants.
export const CMSLink: React.FC<CMSLinkProps> = ({ link, children, ...props }) => {
  if (!link) return null
  const url = getLinkFieldUrl(link)
  if (!url) return null
  const Slot = link.type === 'custom' ? 'a' : HoverPrefetchLink
  return (
    <Slot
      href={url}
      target={link?.newTab ? '_blank' : undefined}
      rel={link?.newTab ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children || link?.label}
    </Slot>
  )
}
