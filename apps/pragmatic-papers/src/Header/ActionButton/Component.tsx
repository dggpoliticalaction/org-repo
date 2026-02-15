import { ButtonBlock } from '@/blocks/Button/Component'
import type { ButtonBlock as ButtonBlockType } from '@/payload-types'
import { ExternalLink } from 'lucide-react'

interface ActionButtonProps extends React.ComponentProps<typeof ButtonBlock> {
  button?: ButtonBlockType
}

export const ActionButton: React.FC<ActionButtonProps> = ({ button }) => {
  return <ButtonBlock button={button} >
    {button?.link?.label || 'Invalid Link'}
    <ExternalLink className="h-4 w-4" />
  </ButtonBlock>
}