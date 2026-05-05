import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types/user"

const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  employee: '/dashboard/overview',
  owner: '/owner/roi-attribution',
  manager: '/manager/coaching-tracker',
}

/**
 * Allowed route prefixes per role.
 * Owners can access both /owner and /manager routes (they oversee managers).
 */
const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  employee: ['/dashboard'],
  owner: ['/owner', '/manager'],
  manager: ['/manager'],
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Unauthenticated: allow /login, redirect everything else
  if (!session) {
    if (
      pathname === '/login/employee' ||
      pathname === '/login/manager' ||
      pathname === '/login/owner' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password'
    ) return NextResponse.next()
    return NextResponse.redirect(new URL('/login/employee', req.url))
  }

  // Authenticated: redirect away from /login and /
  const role = session.user.role as UserRole
  const defaultRoute = ROLE_DEFAULT_ROUTES[role]

  if (pathname === '/login' || pathname === '/') {
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  // Block access to routes not allowed for this role
  const allowedPrefixes = ROLE_ALLOWED_PREFIXES[role]
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isAllowed) {
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/', '/login', '/forgot-password', '/reset-password', '/dashboard/:path*', '/owner/:path*', '/manager/:path*'],
}
