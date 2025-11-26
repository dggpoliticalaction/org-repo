import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content using DOMPurify to prevent XSS attacks.
 * This utility is designed for use in client-side components ('use client').
 *
 * Note: The 'allow' attribute is permitted on iframes because trusted oEmbed endpoints
 * (YouTube, Twitter, etc.) use it for features like autoplay and fullscreen.
 * Since we only fetch HTML from known oEmbed APIs, this is an acceptable risk.
 *
 * @param html - The raw HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return empty string since DOMPurify requires DOM
    // Client components will re-render on the client where sanitization occurs
    return ''
  }

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'blockquote'],
    ADD_ATTR: [
      // iframe attributes needed for social media embeds
      'allow', // Required by YouTube for autoplay, fullscreen features
      'allowfullscreen',
      'frameborder',
      'scrolling',
      // General styling
      'class',
      // Instagram data attributes
      'data-instgrm-captioned',
      'data-instgrm-permalink',
      'data-instgrm-version',
      // Twitter data attributes
      'cite',
      'data-tweet-id',
      'data-width',
      // BlueSky data attributes
      'data-bluesky-uri',
      'data-bluesky-cid',
      // Reddit data attributes
      'data-embed-height',
      'data-embed-created-ts',
      'data-author',
    ],
    ALLOW_DATA_ATTR: true,
  })
}
