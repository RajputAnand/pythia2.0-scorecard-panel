import axios, { type AxiosInstance } from 'axios'
import { redirect } from 'next/navigation'

const LOGIN_ROUTE = '/login/employee'

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

  // Response interceptor — central place for 401 redirects and error normalisation.
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          window.location.href = LOGIN_ROUTE
        } else {
          redirect(LOGIN_ROUTE)
        }
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const pythia1Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_1_API_URL)

export const pythia2Client = createClient(process.env.NEXT_PUBLIC_PYTHIA_2_API_URL)
