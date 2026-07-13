import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { redirect } from 'next/navigation'
import { PYTHIA_2_API } from '@/utils/api-endpoints'

const LOGIN_ROUTE = '/login/employee'

// Bare instance with no interceptors — used only to call /auth/refresh, so a
// failed refresh (e.g. expired/reused refresh token) can't recursively
// trigger another refresh attempt via the response interceptor below.
const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PYTHIA_2_API_URL,
  headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
  })

  // Request interceptor — inject auth token from session when available.
  // Replace the no-op body with: config.headers.Authorization = `Bearer ${token}`
  client.interceptors.request.use((config) => {
    return config
  })

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

          if (typeof window !== 'undefined') {
            window.location.href = LOGIN_ROUTE
          } else {
            redirect(LOGIN_ROUTE)
          }
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const pythia2Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_2_API_URL)
