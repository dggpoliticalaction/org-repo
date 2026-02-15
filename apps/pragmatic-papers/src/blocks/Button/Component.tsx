import { CMSLink } from '@/components/Link/CMSLink2'
import { Button } from '@/components/ui/button'
import type { ButtonBlock as ButtonBlockType } from '@/payload-types'

interface ButtonBlockProps extends React.ComponentProps<typeof Button> {
  button?: ButtonBlockType
}

/**
 * Renders a button based on provided `button` data.
 * Supports different button variants and colors.
 *
 * @param button - ButtonBlockType object, containing link info (label, href, etc.)
 * @param className - Additional CSS classes for styling.
 * @param children - The content to display inside the button.
 * @param props - All other Button props.
 *
 * @example
 * <ButtonBlock button={buttonData} className="my-4">Click Me</ButtonBlock>
 */
export const ButtonBlock: React.FC<ButtonBlockProps> = ({
  button,
  className,
  children,
  ...props
}) => {
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
      {...props}
    >
      <CMSLink link={link}>{children}</CMSLink>
    </Button>
  )
}
