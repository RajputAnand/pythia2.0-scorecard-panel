import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { redirect } from 'next/navigation'
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

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_PYTHIA_2_API_URL,
  headers: { 
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
})

type RetriableConfig = InternalAxiosRequestConfig & { _retriedAfterRefresh?: boolean }

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const { getSession, signIn } = await import('next-auth/react')
      const session = await getSession()

      if (session?.user?.role === 'manager') return null

      const currentRefreshToken = session?.user?.refreshToken
      if (!session || !currentRefreshToken || currentRefreshToken.includes('mock')) return null

      try {
        const { data } = await refreshClient.post(PYTHIA_2_API.auth.refresh, {
          refresh_token: currentRefreshToken,
        })
        if (!data.success) return null

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
