// Endpoints served by the data service (dataClient)
export const PYTHIA_2_API = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
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
    create: '/employees',
    detail: (userId: string) => `/employees/${userId}`,
    credentials: (userId: string) => `/employees/${userId}/credentials`,
  },
  unknownIdentities: {
    list: '/unknown-identities',
    assign: (identityId: string) => `/unknown-identities/${identityId}/assign`,
  },
} as const
