/**
 * Plain `<a>` link that sets a `data-active` attribute based on the current path.
 *
 * Uses standard browser navigation (no Next.js client-side routing) so that
 * responses don't include RSC Vary headers, allowing Cloudflare free-tier
 * to cache pages at the edge.
 */
export const HoverPrefetchLink: React.FC<React.ComponentProps<"a">> = ({
  href = "",
  children,
  className,
  ...props
}) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  )
}
