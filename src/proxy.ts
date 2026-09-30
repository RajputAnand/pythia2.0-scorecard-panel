import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types/user"
import { ROLE_ALLOWED_PREFIXES, ROLE_DEFAULT_ROUTES } from "@/utils/routes"
import { PAGE_REGISTRY } from "@/lib/admin-config-data"

// Maps a page's real route to its Super Admin KPI Visibility field id
const PAGE_HREF_TO_FIELD_ID: Record<string, string> = Object.fromEntries(
  PAGE_REGISTRY.map((entry) => [entry.pageHref, entry.id])
)

async function isPageHiddenByAdmin(pathname: string, token: string): Promise<boolean> {
  const fieldId = PAGE_HREF_TO_FIELD_ID[pathname]
  const apiBase = process.env.NEXT_PUBLIC_PYTHIA_2_API_URL
  if (!fieldId || !apiBase) return false

  try {
    const res = await fetch(new URL('/super-admin/field-config', apiBase), {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return false
    const { configs } = (await res.json()) as { configs?: { fields?: Record<string, boolean> }[] }
    return (configs ?? []).some((config) => config.fields?.[fieldId] === false)
  } catch {
    return false
  }
}

export const proxy = auth(async (req) => {
  // Never intercept Server Action requests with redirects
  if (req.headers.has('next-action')) {
    return NextResponse.next()
  }

  const { pathname } = req.nextUrl
  const session = req.auth
  const isAuthenticated = !!session?.user && session?.error !== 'RefreshAccessTokenError'

  // Unauthenticated or expired session: allow public auth routes, redirect everything else to /login
  if (!isAuthenticated) {
    if (
      pathname === '/login' ||
      pathname === '/login/employee' ||
      pathname === '/login/manager' ||
      pathname === '/login/owner' ||
      pathname === '/login/superadmin' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password'
    ) {
      return NextResponse.next()
    }

    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirectTo', pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated: allow password reset
  if (
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return NextResponse.next()
  }

  const role = session.user.role as UserRole
  const defaultRoute = (role && ROLE_DEFAULT_ROUTES[role]) || '/dashboard/overview'

  // Authenticated: redirect away from login routes and root
  if (
    pathname === '/login' ||
    pathname === '/login/employee' ||
    pathname === '/login/manager' ||
    pathname === '/login/owner' ||
    pathname === '/login/superadmin' ||
    pathname === '/'
  ) {
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  // Block access to routes not allowed for this role
  const allowedPrefixes = (role && ROLE_ALLOWED_PREFIXES[role]) || ['/dashboard']
  const isAllowed = allowedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isAllowed) {
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  // Enforce Super Admin KPI Visibility toggle (skip for mock tokens)
  const token = session.user.pythia2Token
  if (token && pathname !== defaultRoute && (await isPageHiddenByAdmin(pathname, token))) {
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/', '/login', '/login/:path*', '/forgot-password', '/reset-password', '/dashboard/:path*', '/owner/:path*', '/manager/:path*', '/super-admin/:path*'],
}
