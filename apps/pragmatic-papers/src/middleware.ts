import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function middleware(request: NextRequest) {
  const start = Date.now()
  const response = NextResponse.next()

  const duration = Date.now() - start
  const url = request.nextUrl.pathname

  // eslint-disable-next-line no-console
  console.log(
    `[TTFB-TIMING] middleware ${request.method} ${url}: ${duration}ms`,
  )

  response.headers.set('x-middleware-timing', `${duration}ms`)
  response.headers.set('x-request-start', `${start}`)

  return response
}

export const config = {
  matcher: [
    // Match all frontend routes, skip static assets and _next internals
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
