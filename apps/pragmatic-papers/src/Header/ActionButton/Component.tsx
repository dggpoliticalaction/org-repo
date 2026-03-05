import { CMSButton } from '@/components/Button'
import type { ActionButtonField } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { ExternalLink } from 'lucide-react'

interface ActionButtonProps extends React.ComponentProps<typeof CMSButton> {
  button?: ActionButtonField
}

/**
 * Renders an action button based on provided `button` data.
 * Typically used for header actions (e.g., "Get Started") with an external link icon.
 *
 * @param button - ButtonFieldType object, containing link info (label, href, etc.)
 * @param className - Additional CSS classes for styling.
 * @param props - All other ButtonFieldType props.
 *
 * @example
 * <ActionButton button={buttonData} className="hidden lg:flex" />
 */
export const ActionButton: React.FC<ActionButtonProps> = ({ button, className, ...props }) => {
  if (!button?.enabled) return null
  return (
    <CMSButton button={button} className={cn('gap-2', className)} {...props}>
      {button?.link?.label || 'Invalid Link'}
      <ExternalLink className="h-4 w-4" />
    </CMSButton>
  )
}
