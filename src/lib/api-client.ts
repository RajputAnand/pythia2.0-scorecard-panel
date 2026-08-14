import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { redirect } from 'next/navigation'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import { ROLE_LOGIN_ROUTES } from '@/utils/routes'
import type { UserRole } from '@/types/user'

// Fallback when the role can't be resolved (e.g. no session at all) — mirrors
// proxy.ts's own fallback for unauthenticated requests to unknown routes.
const DEFAULT_LOGIN_ROUTE = ROLE_LOGIN_ROUTES.employee

// Resolves which of the three role-specific login pages (/login/employee,
// /login/manager, /login/owner) to send an expired session to. Reads the
// session fresh rather than threading role through refreshAccessToken's
// result, since this also has to cover the "already retried, still 401"
// path where refreshAccessToken isn't called at all.
async function resolveLoginRoute(): Promise<string> {
  try {
    if (typeof window !== 'undefined') {
      const { getSession } = await import('next-auth/react')
      const session = await getSession()
      const role = session?.user?.role as UserRole | undefined
      return role ? ROLE_LOGIN_ROUTES[role] : DEFAULT_LOGIN_ROUTE
    }
    const { auth } = await import('@/auth')
    const session = await auth()
    const role = session?.user?.role as UserRole | undefined
    return role ? ROLE_LOGIN_ROUTES[role] : DEFAULT_LOGIN_ROUTE
  } catch {
    return DEFAULT_LOGIN_ROUTE
  }
}

// Bare instance with no interceptors — used only to call /auth/refresh, so a
// failed refresh (e.g. expired/reused refresh token) can't recursively
// trigger another refresh attempt via the response interceptor below.
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PYTHIA_2_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

type RetriableConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean }

// Coalesces concurrent 401s (e.g. several widgets fetching at once) into a
// single in-flight refresh call. Resolves to the new access token, or null
// if there was nothing to refresh with or the refresh call itself failed.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { getSession, signIn } = await import('next-auth/react')
      const session = await getSession()

      // Manager auth is fully on Pythia 1.0 (see loginManagerViaP1 in
      // src/actions/auth.ts) — there's no Pythia 2.0 refresh token to redeem.
      // session.user.refreshToken for a manager just holds the same raw P1
      // access token, and POST /auth/refresh can't look that up (it was never
      // issued via Pythia 2.0's own _issue_token_pair). Skip straight to the
      // login redirect instead of a call that can only fail.
      if (session?.user?.role === 'manager') return null

      const currentRefreshToken = session?.user?.refreshToken
      if (!session || !currentRefreshToken) return null

      try {
        const { data } = await refreshClient.post(PYTHIA_2_API.auth.refresh, {
          refresh_token: currentRefreshToken,
        })
        if (!data.success) return null

        // Re-sign-in with the refreshed tokens so the session cookie (and every
        // component reading it via useSession) picks up the new pair — no
        // password required, the credentials provider trusts userData as-is.
        await signIn('credentials', {
          userData: JSON.stringify({
            ...session.user,
            token: data.access_token,
            pythia2Token: data.access_token,
            refreshToken: data.refresh_token,
          }),
          redirect: false,
        })

        return data.access_token as string
      } catch {
        return null
      }
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function createClient(baseURL: string | undefined): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  })

  // No request interceptor: every query function in src/queries/ (and
  // src/actions/auth.ts) already resolves its own token and passes it
  // explicitly as `{ headers: { Authorization: `Bearer ${token}` } }` per-call
  // (see AGENTS.md's HTTP Client section). A request interceptor here would
  // only ever re-fetch the session (client: getSession(), server: auth()) and
  // overwrite that header with the same token — a redundant async lookup on
  // every single API call in the app, not a fallback anything relies on.

  // Response interceptor — on 401, try a silent token refresh + one retry
  // before giving up and redirecting to login. Refresh is client-side only:
  // there's no clean way to rewrite the next-auth session cookie mid-render
  // from a server component, so server-side 401s redirect immediately as before.
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const config = error.config as RetriableConfig | undefined
        const wasAuthenticatedRequest = !!config?.headers?.get?.('Authorization')

        // Only a 401 from a request that actually carried a bearer token can
        // mean "session expired" — login/forgot-password/reset-password never
        // send one, and a 401 there just means wrong credentials, a normal
        // business-logic response the caller needs verbatim. Treating it as
        // a session expiry here would (server-side) throw a NEXT_REDIRECT
        // that gets silently swallowed by the caller's own try/catch, masking
        // the real error behind a generic fallback message.
        if (wasAuthenticatedRequest) {
          if (typeof window !== 'undefined' && config && !config._retriedAfterRefresh) {
            const newAccessToken = await refreshAccessToken()
            if (newAccessToken) {
              config._retriedAfterRefresh = true
              config.headers.set('Authorization', `Bearer ${newAccessToken}`)
              return client(config)
            }
          }

          const loginRoute = await resolveLoginRoute()
          if (typeof window !== 'undefined') {
            window.location.href = loginRoute
          } else {
            redirect(loginRoute)
          }
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const pythia1Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_1_API_URL)
export const pythia2Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_2_API_URL)
