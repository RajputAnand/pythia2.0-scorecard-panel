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
    assign: (identityId: string) => `/unknown-identities/${identityId}/assign`,
  },
  managerCoaching: {
    signals: '/manager-coaching/signals',
    signal: (planId: string) => `/manager-coaching/signals/${planId}`,
    summary: '/manager-coaching/summary',
    effectiveness: '/manager-coaching/effectiveness',
    employees: '/manager-coaching/employees',
    employeeDetail: (userId: string) => `/manager-coaching/employees/${userId}`,
  },
} as const
