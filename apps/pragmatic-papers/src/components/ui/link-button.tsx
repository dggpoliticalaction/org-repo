"use client"

import { type ButtonProps, buttonVariants } from "@/components/ui/button"
import { cn } from "@/utilities/ui"
import Link from "next/link"

interface LinkButtonProps extends React.ComponentProps<typeof Link> {
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
    <Link className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {children}
    </Link>
  )
}

export { LinkButton }
