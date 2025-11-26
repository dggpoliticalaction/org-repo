import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content using DOMPurify to prevent XSS attacks.
 * This utility is designed for use in client-side components ('use client').
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
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'class',
      'data-instgrm-captioned',
      'data-instgrm-permalink',
      'data-instgrm-version',
      'cite',
      'data-tweet-id',
      'data-width',
      'data-bluesky-uri',
      'data-bluesky-cid',
      'data-embed-height',
      'data-embed-created-ts',
      'data-author',
    ],
    ALLOW_DATA_ATTR: true,
  })
}
