import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import { ROLE_LOGIN_ROUTES } from '@/utils/routes'
import type { UserRole } from '@/types/user'

const DEFAULT_LOGIN_ROUTE = ROLE_LOGIN_ROUTES.employee

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

import { requestTokenRefresh } from '@/lib/auth-token'

type RetriableConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean }

async function refreshAccessToken(): Promise<string | null> {
  const { getSession, signIn } = await import('next-auth/react')
  const session = await getSession()

  if (session?.user?.role === 'manager') return null

  const currentRefreshToken = session?.user?.refreshToken
  if (!session || !currentRefreshToken || currentRefreshToken.includes('mock')) return null

  const refreshed = await requestTokenRefresh(currentRefreshToken)
  if (!refreshed?.access_token) return null

  await signIn('credentials', {
    userData: JSON.stringify({
      ...session.user,
      token: refreshed.access_token,
      pythia2Token: refreshed.access_token,
      refreshToken: refreshed.refresh_token,
    }),
    redirect: false,
  })

  return refreshed.access_token
}

function createClient(baseURL: string | undefined): AxiosInstance {
  const client = axios.create({
    baseURL,
    headers: { 
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  })

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const config = error.config as RetriableConfig | undefined
        const authHeader = (config?.headers?.get?.('Authorization') as string) || ''
        const wasAuthenticatedRequest = !!authHeader
        const isMockToken = authHeader.includes('mock') || authHeader.includes('test')

        // Do not trigger hard redirect to login if request carries a mock token
        if (wasAuthenticatedRequest && !isMockToken) {
          if (config && !config._retriedAfterRefresh) {
            config._retriedAfterRefresh = true
            if (typeof window !== 'undefined') {
              const newAccessToken = await refreshAccessToken()
              if (newAccessToken) {
                config.headers.set('Authorization', `Bearer ${newAccessToken}`)
                return client(config)
              }
            } else {
              // Server-side reactive refresh on 401
              try {
                const { auth } = await import('@/auth')
                const session = await auth()
                const currentRefreshToken = session?.user?.refreshToken
                if (currentRefreshToken && !currentRefreshToken.includes('mock')) {
                  const refreshed = await requestTokenRefresh(currentRefreshToken)
                  if (refreshed?.access_token) {
                    config.headers.set('Authorization', `Bearer ${refreshed.access_token}`)
                    return client(config)
                  }
                }
              } catch (serverRefreshErr) {
                console.error('[api-client] Server-side 401 token refresh failed:', serverRefreshErr)
              }
            }
          }

          if (typeof window !== 'undefined') {
            const { signOut } = await import('next-auth/react')
            const loginRoute = await resolveLoginRoute()
            await signOut({ callbackUrl: loginRoute })
          }
          // On server side, do NOT call redirect(loginRoute). Redirecting from a server-side
          // Axios interceptor throws NEXT_REDIRECT while NextAuth session cookies are still active,
          // causing middleware (proxy.ts) to bounce the request back to defaultRoute in an infinite loop.
          // By rejecting here, Server Components can catch the error and render an error UI.
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const pythia1Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_1_API_URL)
export const pythia2Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_2_API_URL)
