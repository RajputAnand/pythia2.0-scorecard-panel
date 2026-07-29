import type { UserRole } from "@/types/user"

/** Where each role lands after authenticating. Shared by the proxy (post-login
 * inference from the session cookie) and LoginForm (direct navigation on a
 * successful sign-in, so the client doesn't have to round-trip through '/'
 * and rely on the proxy re-deriving the role from the just-set cookie). */
export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  employee: '/dashboard/overview',
  owner: '/owner/roi-attribution',
  manager: '/manager/coaching-tracker',
}
