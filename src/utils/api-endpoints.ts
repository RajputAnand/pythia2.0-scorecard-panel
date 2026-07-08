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
  auth: {
    exchange: '/auth/exchange',
  },
  dashboard: {
    today: '/dashboard/today',
    weekly: '/dashboard/weekly',
    leaderboard: '/dashboard/leaderboard',
    progress: '/dashboard/progress',
  },
  coaching: {
    moments: '/coaching-moments',
  },
  employees: {
    list: '/employees',
  },
  unknownIdentities: {
    list: '/unknown-identities',
    assign: (identityId: string) => `/unknown-identities/${identityId}/assign`,
  },
} as const
