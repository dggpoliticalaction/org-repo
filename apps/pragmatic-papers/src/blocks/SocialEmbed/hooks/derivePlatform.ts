import { detectPlatform } from '@/blocks/SocialEmbed/helpers/detectPlatform'
import type { Article, SocialEmbedBlock } from '@/payload-types'
import { isAutosave } from '@/utilities/isAutosave'
import type { FieldHookArgs } from 'payload'

export function derivePlatform({
  req,
  value,
  siblingData,
}: FieldHookArgs<Article, string, SocialEmbedBlock>): string | undefined {
  if (isAutosave(req)) return value
  const platform = detectPlatform(siblingData.url || '')
  req.payload.logger.info({ platform }, 'Deriving platform')
  if (platform) {
    siblingData.platform = platform
  }
  return value
}
