import { type Volume } from '@/payload-types'
import { getPayload, type CollectionAfterChangeHook } from 'payload'
import config from '@payload-config'

export const pushToBot: CollectionAfterChangeHook<Volume> = async (args) => {
  // TODO: unpublishing then republishing will not trigger a webhook push
  if (
    args.previousDoc._status != 'draft' ||
    args.doc._status != 'published' ||
    args.previousDoc.publishedAt
  )
    return

  const url = `${args.req.origin}/volumes/${args.data.slug}`
  const payload = await getPayload({ config })
  const webhooks = await payload.find({ collection: 'webhooks' })

  for (const webhook of webhooks.docs) {
    const hasBeenPushed = webhook.pushed?.map((v) => v.id).includes(args.doc.id.toString())
    if (hasBeenPushed) continue

    const res = await fetch(webhook.url, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: url,
        username: 'Pragmatic Papers',
        // avatar_url: ""
      }),
    })
      .then((r) => r)
      .catch((e) => {
        console.error(e)
      })
    if (!res || !res.ok) return
    const articlesPushed = webhook.pushed ?? []
    articlesPushed.push({ volumeNumber: args.doc.volumeNumber, id: args.doc.id.toString() })
    payload.update({
      collection: 'webhooks',
      id: webhook.id,
      data: {
        pushed: articlesPushed,
      },
    })
  }
}
