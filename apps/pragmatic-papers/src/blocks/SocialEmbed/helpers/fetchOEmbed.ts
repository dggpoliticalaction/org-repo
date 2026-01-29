import type { OEmbedResponse } from '@/blocks/SocialEmbed/helpers/oEmbed'
import { failure, type Result, success } from '@/utilities/results'

/**
 * Fetches oEmbed data from a given URL endpoint.
 * This is a protected method available to all adapter implementations.
 * @param url - The oEmbed endpoint URL
 * @param init - Optional fetch init options
 * @returns A Result containing the oEmbed response or an error
 */
export async function fetchOEmbed<T extends OEmbedResponse = OEmbedResponse>(
  url: URL,
  init?: RequestInit,
): Promise<Result<T, Error>> {
  try {
    const res = await fetch(url, init)

    if (!res.ok) throw new Error('Failed to fetch oEmbed.')

    const response = (await res.json()) as T

    return success(response)
  } catch (error) {
    return failure(error instanceof Error ? error : new Error(String(error)))
  }
}
