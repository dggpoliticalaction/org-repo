import { type ButtonVariantProps, buttonVariants } from "@/components/ui/button"
import { cn } from "@/utilities/utils"
import Link from "next/link"

type LinkButtonProps = React.ComponentProps<typeof Link> & ButtonVariantProps

const LinkButton: React.FC<LinkButtonProps> = ({
  children,
  variant,
  className,
  size,
  ...props
}) => {
  return (
    <Link className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Link>
  )
}

export { LinkButton }
