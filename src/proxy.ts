import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { DEMO_USER } from '@/lib/demo-user'

const ROLE_DEFAULT_ROUTES = {
  employee: '/dashboard/overview',
  owner: '/owner/roi-attribution',
  manager: '/manager/coaching-tracker',
} as const

/**
 * Allowed route prefixes per role.
 * Owners can access both /owner and /manager routes (they oversee managers).
 */
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  employee: ['/dashboard'],
  owner: ['/owner', '/manager'],
  manager: ['/manager'],
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = DEMO_USER.role
  const defaultRoute = ROLE_DEFAULT_ROUTES[role]

  // Redirect root to the role's default page
  if (pathname === '/') {
    return NextResponse.redirect(new URL(defaultRoute, request.url))
  }

  // Block access to routes not allowed for this role
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role]
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isAllowed) {
    return NextResponse.redirect(new URL(defaultRoute, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/owner/:path*', '/manager/:path*'],
}
