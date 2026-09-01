import type { UserRole } from "@/types/user"

function isMtEnabled(): boolean {
  return (
    typeof process !== 'undefined' &&
    (process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true' ||
      process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === '1')
  )
}

/** Where each role lands after authenticating. */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  employee: '/dashboard/overview',
  owner: isMtEnabled() ? '/owner/stores' : '/owner/roi-attribution',
  manager: '/manager/employees',
  superadmin: isMtEnabled() ? '/super-admin/tenants' : '/super-admin/kpi-visibility',
}

/** Each role's dedicated login page (see proxy.ts's unauthenticated redirect rules). */
export const ROLE_LOGIN_ROUTES: Record<UserRole, string> = {
  employee: isMtEnabled() ? '/login/tenant' : '/login/employee',
  owner: isMtEnabled() ? '/login/tenant' : '/login/owner',
  manager: isMtEnabled() ? '/login/tenant' : '/login/manager',
  superadmin: isMtEnabled() ? '/login/tenant' : '/login/superadmin',
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
