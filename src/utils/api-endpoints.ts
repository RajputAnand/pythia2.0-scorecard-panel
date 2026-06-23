// Endpoints served by the auth service (authClient)
export const PYTHIA_1_API = {
  auth: {
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  store: {
    list: '/stores/all/mine',
  },
} as const

// Endpoints served by the data service (dataClient)
export const PYTHIA_2_API = {
  scorecard: {
    weekly: '/score/latest/weekly',
  }
} as const
