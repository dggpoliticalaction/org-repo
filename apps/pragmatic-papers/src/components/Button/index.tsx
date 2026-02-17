import { CMSLink } from '@/components/Link/CMSLink2'
import { Button } from '@/components/ui/button'
import type { ButtonField as ButtonFieldType } from '@/payload-types'

interface CMSButtonProps extends React.ComponentProps<typeof Button> {
  button?: ButtonFieldType
}

/**
 * Renders a CMS button based on provided `button` data.
 * Supports different button variants and colors.
 *
 * @param button - ButtonField object, containing link info (label, href, etc.)
 * @param className - Additional CSS classes for styling.
 * @param children - The content to display inside the button.
 * @param props - All other Button props.
 *
 * @example
 * <CMSButton button={buttonData} className="my-4">Click Me</CMSButton>
 */
export const CMSButton: React.FC<CMSButtonProps> = ({ button, className, children, ...props }) => {
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
