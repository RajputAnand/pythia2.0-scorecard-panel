const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const API_ENDPOINTS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
  },
  stores: {
    list: `${BASE_URL}/stores`,
  },
} as const
