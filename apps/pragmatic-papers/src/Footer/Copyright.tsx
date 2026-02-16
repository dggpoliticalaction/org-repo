export const Copyright: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={className} {...props}>
      &copy; {new Date().getFullYear()} {children}
    </div>
  )
}
