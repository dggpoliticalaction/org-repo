import { type ButtonProps, buttonVariants } from "@/components/ui/button"
import { cn } from "@/utilities/utils"

interface LinkButtonProps extends React.ComponentProps<"a"> {
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  variant,
  className,
  size,
  ...props
}) => {
  return (
    // Wearing the button's styles makes it a button as far as anything styling buttons is
    // concerned, so it says so the same way the real one does.
    <a data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </a>
  )
}

export { LinkButton }
