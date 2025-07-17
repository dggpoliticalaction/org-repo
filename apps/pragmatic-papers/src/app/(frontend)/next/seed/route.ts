import { NextResponse } from 'next/server'
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import { isAdmin } from '@/access/checkRole'
import type { User } from '@/payload-types'
import configPromise from '@payload-config'

export async function POST(
  req: Request & {
    cookies: {
      get: (name: string) => {
        value: string
      }
    }
  },
): Promise<NextResponse> {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Seeding is not allowed in production' }, { status: 403 })
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
