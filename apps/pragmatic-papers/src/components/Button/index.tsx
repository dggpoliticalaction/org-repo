import { CMSLink } from "@/components/Link/CMSLink2"
import { Button } from "@/components/ui/button"
import type { ActionButtonField } from "@/payload-types"
import { cn } from "@/utilities/ui"

interface CMSButtonProps extends React.ComponentProps<typeof Button> {
  button?: ActionButtonField // Eventually replace with ButtonField when it's actually generated in payload-types.ts
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
export const CMSButton: React.FC<CMSButtonProps> = ({
  button,
  className,
  children,
  style,
  ...props
}) => {
  const { backgroundColor, textColor, link, variant } = button ?? {}

  return (
    <Button
      type="button"
      variant={variant}
      className={cn(
        "bg-[var(--cms-button-background)] text-[var(--cms-button-foreground)] hover:bg-[color-mix(in_srgb,_var(--cms-button-background),_black_10%)]",
        className,
      )}
      style={
        {
          "--cms-button-background": backgroundColor,
          "--cms-button-foreground": textColor,
          ...style,
        } as React.CSSProperties
      }
      asChild
      {...props}
    >
      <CMSLink link={link}>{children}</CMSLink>
    </Button>
  )
}
