import { Button } from '@/components/ui/button'
import type { Header } from '@/payload-types'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const ActionButton: React.FC<Header['actionButton']> = ({
  enabled,
  backgroundColor,
  textColor,
  link,
}) => {
  if (!enabled) return null

  return (
    <Button
      type="button"
      variant="default"
      style={{
        backgroundColor: backgroundColor || '#000000',
        color: textColor || '#ffffff',
      }}
      className="hidden md:flex font-bold hover:opacity-80 transition-opacity duration-300 items-center gap-2 w-fit"
      asChild
    >
      <Link
        href={link?.url || '/'}
        target={link?.newTab ? '_blank' : '_self'}
        aria-label={`Link to ${link?.label || 'Invalid Link'}`}
        rel={link?.newTab ? 'noopener noreferrer' : undefined}
      >
        {link?.label || 'Invalid Link'}
        <ExternalLink className="w-4 h-4" />
      </Link>
    </Button>
  )
}
