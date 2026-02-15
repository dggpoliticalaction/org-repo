import { ButtonBlock } from '@/blocks/Button/Component'
import type { ButtonBlock as ButtonBlockType } from '@/payload-types'
import { cn } from '@/utilities/ui'
import { ExternalLink } from 'lucide-react'

interface ActionButtonProps extends React.ComponentProps<typeof ButtonBlock> {
  button?: ButtonBlockType
}

export const ActionButton: React.FC<ActionButtonProps> = ({ button, className, ...props }) => {
  return (
    <ButtonBlock button={button} className={cn('gap-2', className)} {...props}>
      {button?.link?.label || 'Invalid Link'}
      <ExternalLink className="h-4 w-4" />
    </ButtonBlock>
  )
}
