import { CMSLink } from '@/components/Link/CMSLink2'
import { Button } from '@/components/ui/button'
import type { ButtonBlock as ButtonBlockType } from '@/payload-types'

interface ButtonBlockProps extends React.ComponentProps<typeof Button> {
  button?: ButtonBlockType
}

export const ButtonBlock: React.FC<ButtonBlockProps> = (props) => {
  const { button, className, children } = props

  const { backgroundColor, textColor, link, variant } = button ?? {}

  return (
    <Button
      type="button"
      variant={variant}
      style={{
        backgroundColor: backgroundColor ?? undefined,
        color: textColor ?? undefined,
      }}
      className={className}
      asChild
    >
      <CMSLink link={link}>{children}</CMSLink>
    </Button>
  )
}
