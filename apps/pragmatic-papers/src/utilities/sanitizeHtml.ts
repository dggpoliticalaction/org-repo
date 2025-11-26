import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content using DOMPurify to prevent XSS attacks
 * @param html - The raw HTML string to sanitize
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return empty string as DOMPurify needs a DOM
    // The HTML will be sanitized on the client side when it renders
    return html
  }

  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe', 'blockquote', 'script'],
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
      'sandbox',
      'data-embed-height',
      'data-embed-created-ts',
      'data-author',
    ],
    ALLOW_DATA_ATTR: true,
  })
}
