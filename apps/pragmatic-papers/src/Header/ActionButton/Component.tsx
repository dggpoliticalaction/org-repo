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
      className="hidden w-fit items-center gap-2 font-bold transition-opacity duration-300 hover:opacity-80 md:flex"
      asChild
    >
      <Link
        href={link?.url || '/'}
        target={link?.newTab ? '_blank' : '_self'}
        aria-label={`Link to ${link?.label || 'Invalid Link'}`}
        rel={link?.newTab ? 'noopener noreferrer' : undefined}
      >
        {link?.label || 'Invalid Link'}
        <ExternalLink className="h-4 w-4" />
      </Link>
    </Button>
  )
}
