import { auth } from '@/auth'
import { DEMO_USERS } from '@/lib/demo-user'
import type { User } from '@/types/user'

/**
 * Server-side helper: resolves the full User object (including stores) for the
 * currently authenticated session. Uses the session email to look up the full
 * profile from DEMO_USERS, bypassing any JWT staleness issues.
 *
 * Returns `null` when there is no active session.
 */
export async function getUser(): Promise<User | null> {
  const session = await auth()
  if (!session?.user?.email) return null

  const demo = DEMO_USERS.find((u) => u.email === session.user.email)
  if (!demo) {
    // Fallback: cast the session user (covers real API users when backend is ready)
    return session.user as unknown as User
  }

  const { password: _pw, email: _email, ...user } = demo
  return user
}
