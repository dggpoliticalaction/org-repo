import { CMSButton } from "@/components/Button"
import type { ActionButtonField } from "@/payload-types"
import { cn } from "@/utilities/utils"
import { ExternalLink } from "lucide-react"

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
  const { backgroundColor, textColor } = button ?? {}

  return (
    <CMSButton
      link={button?.link}
      variant={button?.variant}
      className={cn(
        "gap-2 bg-(--cms-button-background) text-(--cms-button-foreground) hover:bg-[color-mix(in_srgb,var(--cms-button-background),black_10%)]",
        className,
      )}
      style={
        {
          "--cms-button-background": backgroundColor,
          "--cms-button-foreground": textColor,
        } as unknown as React.CSSProperties
      }
      {...props}
    >
      {button?.link?.label || "Invalid Link"}
      <ExternalLink className="h-4 w-4" />
    </CMSButton>
  )
}
