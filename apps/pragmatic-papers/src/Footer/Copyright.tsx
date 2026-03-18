import { cn } from "@/utilities/utils"

type CopyrightPropsWithChildren = {
  children: React.ReactNode
  copyright?: never
} & React.HTMLAttributes<HTMLDivElement>

type CopyrightPropsWithCopyright = {
  copyright: string
  children?: never
} & React.HTMLAttributes<HTMLDivElement>

type CopyrightProps = CopyrightPropsWithChildren | CopyrightPropsWithCopyright

/**
 * Copyright footer component for displaying copyright information.
 *
 * @param {CopyrightProps} props - Props for the Copyright component.
 * @param {React.ReactNode} [props.children] - Optional children to display in place of copyright text.
 * @param {string} [props.className] - Optional CSS class for the outer div.
 * @param {string} [props.copyright] - Optional copyright string. If not provided, children will be rendered instead.
 * @returns {JSX.Element} The copyright notice, including the current year.
 *
 * Example usage:
 * ```tsx
 *   <Copyright className="mt-4" copyright="MySite" />
 * ```
 */
export const Copyright: React.FC<CopyrightProps> = ({ className, copyright, ...props }) => {
  return (
    <div className={cn("text-sm", className)} {...props}>
      &copy; {new Date().getFullYear()} {copyright}
    </div>
  )
}
