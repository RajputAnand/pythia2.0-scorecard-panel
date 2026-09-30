import { PYTHIA_2_API } from '@/utils/api-endpoints'

export interface RefreshResult {
  access_token: string
  refresh_token: string
}

const refreshPromises = new Map<string, Promise<RefreshResult | null>>()

/**
 * Extracts expiration timestamp (in milliseconds) from a JWT without external libraries.
 */
export function getJwtExp(token?: string): number | null {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = typeof window === 'undefined'
      ? Buffer.from(base64, 'base64').toString('utf8')
      : atob(base64)
    const payload = JSON.parse(json)
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

/**
 * Checks if a JWT token is expired or close to expiration (within bufferMs).
 */
export function isTokenExpired(token?: string, bufferMs = 60000): boolean {
  if (!token) return true
  const exp = getJwtExp(token)
  if (!exp) return false
  return Date.now() >= exp - bufferMs
}

/**
 * Calls POST /auth/refresh with single-flight deduplication.
 * Prevents multiple parallel requests from rotating the token twice and invalidating the token family.
 */
export async function requestTokenRefresh(refreshToken: string): Promise<RefreshResult | null> {
  if (!refreshToken || refreshToken.includes('mock') || refreshToken.includes('test')) {
    return null
  }

  // Deduplicate concurrent refresh requests for the same token
  const existing = refreshPromises.get(refreshToken)
  if (existing) return existing

  const promise = (async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_PYTHIA_2_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
      const response = await fetch(`${baseUrl}${PYTHIA_2_API.auth.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        cache: 'no-store',
      })

      if (!response.ok) {
        console.warn(`[auth-token] Token refresh returned HTTP ${response.status}`)
        return null
      }

      const data = await response.json()
      if (data?.access_token && data?.refresh_token) {
        return {
          access_token: data.access_token as string,
          refresh_token: data.refresh_token as string,
        }
      }
      return null
    } catch (err) {
      console.error('[auth-token] Token refresh failed:', err)
      return null
    } finally {
      refreshPromises.delete(refreshToken)
    }
  })()

  refreshPromises.set(refreshToken, promise)
  return promise
}
