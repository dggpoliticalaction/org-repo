import { type ButtonVariantProps, buttonVariants } from "@/components/ui/button"
import { cn } from "@/utilities/utils"
import Link, { type LinkProps } from "next/link"

interface LinkButtonProps extends LinkProps, ButtonVariantProps {
  children: React.ReactNode
  className?: string
}

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
