import { isAdmin } from '@/access/checkRole'
import { seed } from '@/endpoints/seed'
import type { User } from '@/payload-types'
import configPromise from '@payload-config'
import { NextResponse, type NextRequest } from 'next/server'
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Seeding is reachable by endpoint on dev and staging; leave unset (or "false") in production.
    if (process.env.SEED_ENABLED !== 'true') {
      return NextResponse.json({ error: 'Seeding is not enabled in this environment' }, { status: 403 })
    }

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    })

    if (!user || !isAdmin(user as User)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only admins can seed the database.' },
        { status: 403 },
      )
    }

    await seed(payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error seeding database:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
