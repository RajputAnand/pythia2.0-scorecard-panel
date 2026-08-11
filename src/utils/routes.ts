import type { UserRole } from "@/types/user"

/** Where each role lands after authenticating. Shared by the proxy (post-login
 * inference from the session cookie) and LoginForm (direct navigation on a
 * successful sign-in, so the client doesn't have to round-trip through '/'
 * and rely on the proxy re-deriving the role from the just-set cookie). */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  employee: '/dashboard/overview',
  owner: '/owner/roi-attribution',
  manager: '/manager/coaching-tracker',
  superadmin: '/super-admin/kpi-visibility',
}

/** Each role's dedicated login page (see proxy.ts's unauthenticated redirect rules). */
export const ROLE_LOGIN_ROUTES: Record<UserRole, string> = {
  employee: '/login/employee',
  owner: '/login/owner',
  manager: '/login/manager',
  superadmin: '/login/superadmin',
}

/** Allowed route prefixes per role. Owners can access both /owner and /manager
 * routes (they oversee managers). Shared by proxy.ts (blocking disallowed routes)
 * and getSafeRedirect below (validating a post-login redirectTo target). */
export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  employee: ['/dashboard'],
  owner: ['/owner', '/manager'],
  manager: ['/manager'],
  superadmin: ['/super-admin'],
}

/** Validates a `redirectTo` query value before sending a just-authenticated user
 * there: it must be a same-origin relative path (rejects absolute/protocol-relative
 * URLs to guard against open redirects) within a prefix the role is actually
 * allowed to access. Falls back to the role's default route otherwise. */
export function getSafeRedirect(redirectTo: string | null | undefined, role: UserRole): string {
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return ROLE_DEFAULT_ROUTES[role]
  }

  const isAllowed = ROLE_ALLOWED_PREFIXES[role].some((prefix) => redirectTo.startsWith(prefix))
  return isAllowed ? redirectTo : ROLE_DEFAULT_ROUTES[role]
}
