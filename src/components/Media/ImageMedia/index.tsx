import type { Media as MediaType } from "@/payload-types"
import NextImage, { type ImageProps } from "next/image"
import React from "react"

import { cn } from "@/utilities/utils"

// A base64 encoded image to use as a placeholder while the image is loading
const placeholderBlur =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAABchJREFUWEdtlwtTG0kMhHtGM7N+AAdcDsjj///EBLzenbtuadbLJaZUTlHB+tRqSesETB3IABqQG1KbUFqDlQorBSmboqeEBcC1d8zrCixXYGZcgMsFmH8B+AngHdurAmXKOE8nHOoBrU6opcGswPi5KSP9CcBaQ9kACJH/ALAA1xm4zMD8AczvQCcAQeJVAZsy7nYApTSUzwCHUKACeUJi9TsFci7AHmDtuHYqQIC9AgQYKnSwNAig4NyOOwXq/xU47gDYggarjIpsRSEA3Fqw7AGkwgW4fgALAdiC2btKgNZwbgdMbEFpqFR2UyCR8xwAhf8bUHIGk1ckMyB5C1YkeWAdAPQBAeiD6wVYPoD1HUgXwFagZAGc6oSpTmilopoD5GzISQD3odcNIFca0BUQQM5YA2DpHV0AYURBDIAL0C+ugC0C4GedSsVUmwC8/4w8TPiwU6AClJ5RWL1PgQNkrABWdKB3YF3cBwRY5lsI4ApkKpCQi+FIgFJU/TDgDuAxAAwonJuKpGD1rkCXCR1ALyrAUSSEQAhwBdYZ6DPAgSUA2c1wKIZmRcHxMzMYR9DH8NlbkAwwApSAcABwBwTAbb6owAr0AFiZPILVEyCtMmK2jCkTwFDNUNj7nJETQx744gCUmgkZVGJUHyakEZE4W91jtGFA9KsD8Z3JFYDlhGYZLWcllwJMnplcPy+csFAgAAaIDOgeuAGoB96GLZg4kmtfMjnr6ig5oSoySsoy3ya/FMivXZWxwr0KIf9nACbfqcBEgmBSAtAlIT83R+70IWpyACamIjf5E1Iqb9ECVmnoI/FvAIRk8s2J0Y5IquQDgB+5wpScw5AUTC75VTmTs+72NUzoCvQIaAXv5Q8PDAZKLD+MxLv3RFE7KlsQChgBIlKiCv5ByaZv3gJZNm8AnVMhAN+EjrtTYQMICJpu6/0aiQnhClANlz+Bw0cIWa8ev0sBrtrhAyaXEnrfGfATQJiRKih5vKeOHNXXPFrgyamAADh0Q4F2/sESojomDS9o9k0b0H83xjB8qL+JNoTjN+enjpaBpingRh4e8MSugudM030A8FeqMI6PFIgNyPehkpZWGFEAARIQdH5LcAAqIACHkAJqg4OoBccHAuz76wr4BbzFOEa8iBuAZB8AtJHLP2VgMgJw/EIBowo7HxCAH3V6dAXEE/vZ5aZIA8BP8RKhm7Cp8BnAMnAQADdgQDA520AVIpScP+enHz0Gwp25h4i2dPg5FkDXrbsdJikQwXuWgaM5gEMk1AgH4DKKFjDf3bMD+FjEeIxLlRKYnBk2BbquvSDCAQ4gwZiMAAmH4gBTyRtEsYxi7gP6QSrc//39BrDNqG8rtYTmC4BV1SfMhOhaumFCT87zy4pPhQBZEK1kQVRjJBBi7AOlePgyAPYjwlvtagx9e/dnQraAyS894TIkkAIEYMKEc8k4EqJ68lZ5jjNqcQC2QteQOf7659umwBgPybNtK4dg9WvnMyFwXYGP7uEO1lwJgAnPNeMYMVXbIIYKFioI4PGFt+BWPVfmWJdjW2lTUnLGCswECAgaUy86iwA1464ajo0QhgMBFGyBoZahANsMpMfXr1JA1SN29m5lqgXj+UPV85uRA7yv/KYUO4Tk7Hc1AZwbIRzg0AyNj2UlAMwfSLSMnl7fdAbcxHuA27YaAMvaQ4GOjwX4RTUGAG8Ge14N963g1AynqUiFqRX9noasxT4b8entNRQYyamk/3tYcHsO7R3XJRRYOn4tw4iUnwBM5gDnySGOreAwAGo8F9IDHEcq8Pz2Kg/oXCpuIL6tOPD8LsDn0ABYQoGFRowlsAEUPPDrGAGowAbgKsgDMmE8mDy/vXQ9IAwI7u4wta+gAdAdgB64Ah9SgD4IgGKhwACoAjgNgFDhtxY8f33ZTMjqdTAiHMBPrn8ZWkEfzFdX4Oc1AHg3+ADbvN8PU8WdFKg4Tt6CQy2+D4YHaMT/JP4XzbAq98cPDIUAAAAASUVORK5CYII="

export type ImageVariant = keyof Required<MediaType>["sizes"]

export interface ImageMediaProps extends Omit<ImageProps, "src" | "alt" | "width" | "height"> {
  media: MediaType
  variant?: ImageVariant
  containerClassName?: string
}

function getMediaByVariant(
  media: MediaType,
  variant: ImageVariant,
): Required<MediaType>["sizes"][ImageVariant] {
  return media.sizes?.[variant]
}

/**
 * ImageMedia
 * TODO: Rename ImageMedia to `CMSImage`
 *
 * Passes the Payload media URL directly to Next.js Image without making it absolute.
 *
 * - **Relative paths** (local storage: `/media/filename`, `/api/media/file/filename`):
 *   passed as-is. Next.js `_next/image` fetches them via `http://localhost:PORT` internally,
 *   avoiding self-referential external HTTP requests through the reverse proxy (hairpin NAT).
 *
 * - **Absolute URLs** (S3/Supabase: `https://cdn.example.com/...`):
 *   passed through unchanged. The hostname must be listed in `remotePatterns` in next.config.js.
 *
 * For og:image / RSS feed usage, `getMediaUrl()` (in generateMeta / generateRssFeed) still
 * produces absolute URLs as required.
 */
export const ImageMedia: React.FC<ImageMediaProps> = ({
  media,
  variant,
  sizes,
  className,
  quality = 80,
  priority, // TODO rename to `preload` after upgrading to Next.js 16
  loading,
  fill,
  style,
  ...props
}) => {
  if (!media.url) return null

  // Build src without making relative paths absolute.
  // Relative paths (local storage: /media/filename or /api/media/file/filename) are passed
  // directly to Next.js <Image> so _next/image fetches them via http://localhost:PORT
  // internally — no external round-trip through the Coolify proxy.
  // Absolute S3/Supabase URLs pass through unchanged and are fetched from the CDN.
  const buildSrc = (url: string | null | undefined): string => {
    if (!url) return ""
    return media.updatedAt ? `${url}?${media.updatedAt}` : url
  }

  let src = buildSrc(media.url)
  const alt = media.alt || "" // TODO: alt should be required
  let width = media.width ?? undefined
  let height = media.height ?? undefined
  const blurDataURL = media.blurDataURL ?? placeholderBlur
  loading = priority !== undefined ? undefined : loading // loading and priority are mutually exclusive

  if (variant) {
    const mediaBySize = getMediaByVariant(media, variant)
    src = buildSrc(mediaBySize?.url) || src
    width = mediaBySize?.width || width
    height = mediaBySize?.height || height
  }

  if (fill) {
    width = undefined
    height = undefined
  }

  const objectPosition =
    media.focalX != null && media.focalY != null ? `${media.focalX}% ${media.focalY}%` : undefined

  style = objectPosition ? { ...style, objectPosition } : style

  return (
    <NextImage
      {...props}
      style={style}
      className={cn("rounded-sm", className)}
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      quality={quality}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      loading={loading}
      placeholder="blur"
      blurDataURL={blurDataURL}
    />
  )
}
