import { getAdapter } from '@/blocks/SocialEmbed/adapters'
import { isOEmbedRich, isOEmbedThumbnail } from '@/blocks/SocialEmbed/helpers/oEmbed'
import type { Article, SocialEmbedBlock } from '@/payload-types'
import { isAutosave } from '@/utilities/isAutosave'
import { isFailure } from '@/utilities/results'
import type { FieldHookArgs } from 'payload'

// TODO: Make this configurable in admin settings eventually.
const maxwidth = 550

export async function fetchSnapshot({
  req,
  siblingData,
  operation,
  value = '',
}: FieldHookArgs<Article, string, SocialEmbedBlock>): Promise<string> {
  if (isAutosave(req)) return value

  req.payload.logger.info({ value, operation }, 'Fetching oEmbed snapshot')

  if (!siblingData.platform) {
    siblingData.snapshot = {
      ...siblingData.snapshot,
      status: 'error',
      title: 'No platform found',
      fetchedAt: new Date().toISOString(),
    }
    return value
  }

  const adapter = getAdapter(siblingData.platform)
  if (!adapter) {
    siblingData.snapshot = {
      ...siblingData.snapshot,
      status: 'not_found',
      fetchedAt: new Date().toISOString(),
    }
    return value
  }

  const result = await adapter.getOEmbed({ url: value, maxwidth })

  if (isFailure(result)) {
    req.payload.logger.info({ result: result.error.message }, 'Failed to fetch oEmbed snapshot')
    siblingData.snapshot = {
      ...siblingData.snapshot,
      status: 'forbidden',
      fetchedAt: new Date().toISOString(),
    }
    return value
  }

  const {
    provider_name: providerName,
    provider_url: providerURL,
    author_name: authorName,
    author_url: authorURL,
    title,
    ...rest
  } = result.value

  let html: string | undefined
  if (isOEmbedRich(result.value)) {
    html = await adapter.sanitize(result.value.html)
  }

  let thumbnailURL: string | undefined
  if (isOEmbedThumbnail(rest)) {
    thumbnailURL = rest.thumbnail_url
  }

  siblingData.snapshot = {
    ...siblingData.snapshot,
    status: 'ok',
    providerName,
    providerURL,
    authorName,
    authorURL,
    title,
    html,
    thumbnailURL,
    fetchedAt: new Date().toISOString(),
  }

  return value
}
