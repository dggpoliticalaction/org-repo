import { NextRequest, NextResponse } from 'next/server'
import type { CollectionSlug } from 'payload'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import configPromise from '@payload-config'

export async function GET(request: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(request.url)

  const path = searchParams.get('path')
  const collection = searchParams.get('collection') as CollectionSlug
  const slug = searchParams.get('slug')
  const previewSecret = searchParams.get('previewSecret')

  if (previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  if (!path || !collection || !slug) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  const token = request.cookies.get('payload-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Missing payload-token' }, { status: 401 })
  }

  const authArgs: Parameters<typeof payload.auth>[0] = {
    headers: new Headers({
      cookie: request.headers.get('cookie') ?? `payload-token=${token}`,
    }),
  }

  try {
    const { user } = await payload.auth(authArgs)
    const draft = await draftMode()

    if (!user) {
      draft.disable()
      return NextResponse.json(
        { error: 'You are not allowed to preview this page' },
        { status: 403 },
      )
    }

    draft.enable()
    redirect(path)
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return NextResponse.json({ error: 'You are not allowed to preview this page' }, { status: 403 })
  }
}
