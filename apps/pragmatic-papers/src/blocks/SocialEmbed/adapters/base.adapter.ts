import type { OEmbedResponse } from '@/blocks/SocialEmbed/helpers/oEmbed'
import type { Result } from '@/utilities/results'

/**
 * Base shape for oEmbed request options.
 * All adapters accept at least this. Each adapter can extend this type
 * to add platform-specific oEmbed parameters (e.g. theme, hideMedia).
 */
export interface OEmbedOptionsBase {
  /** The URL of the post to fetch oEmbed data for. */
  url: string
  /** Maximum width of the embed. Common oEmbed parameter; adapters may ignore. */
  maxwidth?: number
}

/**
 * Abstract base class for social media platform adapters.
 * Provides common functionality that all adapters can use.
 * Each platform extends this class with its own options and response types.
 *
 * @typeParam TOptions - Adapter-specific oEmbed options (extends OEmbedOptionsBase)
 * @typeParam TResponse - Adapter-specific oEmbed response (extends OEmbedResponse)
 */
export abstract class SocialAdapter<
  TOptions extends OEmbedOptionsBase = OEmbedOptionsBase,
  TResponse extends OEmbedResponse = OEmbedResponse,
> {
  /**
   * Validates if a URL is a valid post URL for this platform.
   * Must be implemented by each adapter.
   * @param url - The URL to validate
   * @returns true if the URL is valid for this platform, false otherwise
   */
  abstract isValidUrl(url: string): boolean

  /**
   * Fetches the oEmbed data for the given options.
   * Each adapter implements this with its class's TOptions and TResponse.
   * @param options - Options object; shape is defined by the adapter's TOptions
   * @param init - Optional fetch init (e.g. cache, headers)
   * @returns A Result containing the oEmbed response or an error
   */
  abstract getOEmbed(options: TOptions, init?: RequestInit): Promise<Result<TResponse, Error>>

  /**
   * Sanitizes HTML content from the platform's oEmbed response.
   * Preserves platform-specific attributes needed for embedding.
   * Must be implemented by each adapter.
   * @param html - The HTML string to sanitize
   * @returns The sanitized HTML string
   */
  abstract sanitize(html: string): Promise<string>
}
