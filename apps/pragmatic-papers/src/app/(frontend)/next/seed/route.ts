import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import { isAdmin } from '@/access/checkRole'
import type { User } from '@/payload-types'
import configPromise from '@payload-config'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Seeding is not allowed in production' }, { status: 403 })
    }

    const payload = await getPayload({ config: configPromise })
    const token = request.cookies.get('payload-token')?.value
     if (!token) {
       return NextResponse.json({ error: 'Missing payload-token' }, { status: 401 })
     }
     const authArgs: Parameters<typeof payload.auth>[0] = {
       headers: new Headers({
       cookie: request.headers.get('cookie') ?? `payload-token=${token}`,
       }),
     }

    const { user } = await payload.auth(authArgs)
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
