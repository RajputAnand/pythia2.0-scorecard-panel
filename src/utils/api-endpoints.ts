const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const API_ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
  },
  stores: {
    list: `${BASE_URL}/stores`,
  },
} as const
