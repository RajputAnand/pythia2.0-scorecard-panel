// Endpoints served by the data service (dataClient)
export const PYTHIA_2_API = {
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  dashboard: {
    summary: '/dashboard/summary',
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
    count: '/unknown-identities/count',
    trashed: '/unknown-identities/trashed',
    assign: (identityId: string) => `/unknown-identities/${identityId}/assign`,
    trash: (identityId: string) => `/unknown-identities/${identityId}/trash`,
    restore: (identityId: string) => `/unknown-identities/${identityId}/restore`,
  },
  managerCoaching: {
    signals: '/manager-coaching/signals',
    signal: (planId: string) => `/manager-coaching/signals/${planId}`,
    summary: '/manager-coaching/summary',
    effectiveness: '/manager-coaching/effectiveness',
    employees: '/manager-coaching/employees',
    employeeDetail: (userId: string) => `/manager-coaching/employees/${userId}`,
  },
  managerDashboard: {
    summary: '/manager-dashboard/summary',
    leaderboard: '/manager-dashboard/leaderboard',
    trend: '/manager-dashboard/trend',
  },
  superAdmin: {
    demos: '/super-admin/demos',
    manualSend: '/super-admin/manual-send',
    bulkTrigger: '/super-admin/bulk-trigger',
    sentStatus: '/super-admin/sent-status',
  },
} as const
