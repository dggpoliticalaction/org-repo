import { getAdapter } from '@/blocks/SocialEmbed/adapters'
import { OEmbedRequestError } from '@/blocks/SocialEmbed/helpers/fetchOEmbed'
import { isOEmbedRich, isOEmbedThumbnail } from '@/blocks/SocialEmbed/helpers/oEmbed'
import type { Article, SocialEmbedBlock } from '@/payload-types'
import { isAutosave } from '@/utilities/isAutosave'
import { isFailure } from '@/utilities/results'
import type { FieldHookArgs } from 'payload'

export async function fetchSnapshot({
  req,
  siblingData,
  value = '',
}: FieldHookArgs<Article, string, SocialEmbedBlock>): Promise<string> {
  if (isAutosave(req)) return value

  if (!siblingData.platform) {
    siblingData.snapshot = {
      ...siblingData.snapshot,
      status: 'not_found',
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
      title: 'No adapter found',
      fetchedAt: new Date().toISOString(),
    }
    return value
  }

  const result = await adapter.getOEmbed({
    url: value,
    ...(siblingData.platform === 'twitter' && {
      hideMedia: siblingData.hideMedia,
      hideThread: siblingData.hideThread,
    }),
  })

  if (isFailure(result)) {
    siblingData.snapshot = {
      ...siblingData.snapshot,
      status: result.error instanceof OEmbedRequestError ? result.error.code : 'error',
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
