import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types/user"
import { ROLE_ALLOWED_PREFIXES, ROLE_DEFAULT_ROUTES } from "@/utils/routes"
import { PAGE_REGISTRY } from "@/lib/admin-config-data"

// Maps a page's real route to its Super Admin KPI Visibility field id
const PAGE_HREF_TO_FIELD_ID: Record<string, string> = Object.fromEntries(
  PAGE_REGISTRY.map((entry) => [entry.pageHref, entry.id])
)

const MULTI_TENANT_ROUTES = [
  '/login/tenant',
  '/super-admin/onboarding',
  '/super-admin/tenants',
  '/super-admin/owners',
  '/owner/stores',
  '/super-admin/owner/stores',
]

function isMultiTenantFeatureEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === '1'
  )
}

async function isPageHiddenByAdmin(pathname: string, token: string): Promise<boolean> {
  const fieldId = PAGE_HREF_TO_FIELD_ID[pathname]
  const apiBase = process.env.NEXT_PUBLIC_PYTHIA_2_API_URL
  if (!fieldId || !apiBase || token.includes('mock')) return false

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
  const { pathname } = req.nextUrl
  const session = req.auth
  const isMtEnabled = isMultiTenantFeatureEnabled()

  // Guard multi-tenant routes when feature flag is disabled
  if (!isMtEnabled && MULTI_TENANT_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!session?.user) {
      return NextResponse.redirect(new URL('/login/employee', req.url))
    }
    const userRole = session.user.role as UserRole
    return NextResponse.redirect(new URL(ROLE_DEFAULT_ROUTES[userRole] || '/dashboard/overview', req.url))
  }

  // Unauthenticated: allow login routes, redirect everything else
  if (!session?.user) {
    if (
      pathname === '/login/employee' ||
      pathname === '/login/manager' ||
      pathname === '/login/owner' ||
      pathname === '/login/superadmin' ||
      pathname.startsWith('/login/tenant') ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password'
    ) {
      return NextResponse.next()
    }

    const fallbackLogin = isMtEnabled ? '/login/tenant' : '/login/employee'
    const loginUrl = new URL(fallbackLogin, req.url)
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
