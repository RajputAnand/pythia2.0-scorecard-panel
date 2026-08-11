import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types/user"
import { ROLE_ALLOWED_PREFIXES, ROLE_DEFAULT_ROUTES } from "@/utils/routes"

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Unauthenticated: allow /login, redirect everything else
  if (!session?.user) {
    if (
      pathname === '/login/employee' ||
      pathname === '/login/manager' ||
      pathname === '/login/owner' ||
      pathname === '/login/superadmin' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password'
    ) return NextResponse.next()

    // Carry the page the user was trying to reach so LoginForm can send them
    // back there (instead of the role's default route) once they sign in.
    const loginUrl = new URL('/login/employee', req.url)
    loginUrl.searchParams.set('redirectTo', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
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
  matcher: ['/', '/login', '/forgot-password', '/reset-password', '/dashboard/:path*', '/owner/:path*', '/manager/:path*', '/super-admin/:path*'],
}
