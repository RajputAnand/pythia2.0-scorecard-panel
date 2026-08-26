import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types/user"
import { ROLE_ALLOWED_PREFIXES, ROLE_DEFAULT_ROUTES } from "@/utils/routes"
import { PAGE_REGISTRY } from "@/lib/admin-config-data"

// Maps a page's real route to its Super Admin KPI Visibility field id, so a
// request can be checked against the same toggle Sidebar.tsx / KpiVisibilityPanel
// already use — without this, disabling a page there only hid its sidebar link
// and (for the one employee-dashboard endpoint that applies it) trimmed the API
// payload; typing the URL in directly still reached the page.
const PAGE_HREF_TO_FIELD_ID: Record<string, string> = Object.fromEntries(
  PAGE_REGISTRY.map((entry) => [entry.pageHref, entry.id])
)

// GET /super-admin/field-config is readable by any authenticated role (see
// admin-config.ts / AGENTS.md) and returns every role's doc in one call, so
// one fetch is enough regardless of which role is making the request.
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
    // Fail open: a config-service hiccup shouldn't lock a role out of a page
    // that was never actually disabled — same default-visible fallback the
    // client uses (`visibility[id] ?? true`).
    return false
  }
}

export const proxy = auth(async (req) => {
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

  // Enforce the Super Admin's page-level KPI Visibility toggle here too — it
  // previously only hid the sidebar link (and, for one endpoint, trimmed the
  // payload), so a page turned off for this role was still reachable by URL.
  // Skip when pathname is already the role's default route — redirecting a
  // hidden default route to itself would otherwise loop forever.
  const token = session.user.pythia2Token
  if (token && pathname !== defaultRoute && (await isPageHiddenByAdmin(pathname, token))) {
    return NextResponse.redirect(new URL(defaultRoute, req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/', '/login', '/forgot-password', '/reset-password', '/dashboard/:path*', '/owner/:path*', '/manager/:path*', '/super-admin/:path*'],
}
