import type { UserRole } from "@/types/user"

/** Where each role lands after authenticating. */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  employee: '/dashboard/overview',
  owner: '/owner/roi-attribution',
  manager: '/manager/employees',
  superadmin: '/super-admin/kpi-visibility',
}

/** Unified login page for all roles. */
export const ROLE_LOGIN_ROUTES: Record<UserRole, string> = {
  employee: '/login',
  owner: '/login',
  manager: '/login',
  superadmin: '/login',
}

/** Allowed route prefixes per role. */
export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  employee: ['/dashboard'],
  owner: ['/owner', '/manager'],
  manager: ['/manager'],
  superadmin: ['/super-admin'],
}

/** Validates a `redirectTo` query value before sending a just-authenticated user there. */
export function getSafeRedirect(redirectTo: string | null | undefined, role: UserRole): string {
  if (!redirectTo || !redirectTo.startsWith('/') || redirectTo.startsWith('//')) {
    return ROLE_DEFAULT_ROUTES[role]
  }

  const isAllowed = ROLE_ALLOWED_PREFIXES[role].some((prefix) => redirectTo.startsWith(prefix))
  return isAllowed ? redirectTo : ROLE_DEFAULT_ROUTES[role]
}
