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
  demographics: {
    ageDistribution: '/demographics/age-distribution',
    genderDistribution: '/demographics/gender-distribution',
    customerSegments: '/demographics/customer-segments',
  },
  benchmarking: {
    allStoreData: '/benchmarking/all_store_data',
    networkIntelligence: '/benchmarking/network_intelligence',
  },
  roi: {
    attribution: '/roi/attribution',
  },
  coaching: {
    moments: '/coaching-moments',
  },
  employees: {
    list: '/employees',
    create: '/employees',
    archived: '/employees/archived',
    detail: (userId: string) => `/employees/${userId}`,
    credentials: (userId: string) => `/employees/${userId}/credentials`,
    archive: (userId: string) => `/employees/${userId}/archive`,
    unarchive: (userId: string) => `/employees/${userId}/unarchive`,
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
    fieldConfig: '/super-admin/field-config',
    fieldConfigForRole: (roleName: string) => `/super-admin/field-config/${roleName}`,
  },
  deviceHealth: {
    list: '/device-states',
    detail: (deviceId: string) => `/device-states/${deviceId}`,
    ws: '/device-states/ws',
  },
  staffing: {
    schedule: '/staffing/schedule',
    scheduleGenerate: '/staffing/schedule/generate',
    scheduleEntry: (shiftId: string) => `/staffing/schedule/${shiftId}`,
    schedulePublish: '/staffing/schedule/publish',
    roster: '/staffing/roster',
    trafficHeatmap: '/staffing/traffic-heatmap',
    insights: '/staffing/insights',
    recommendations: '/staffing/recommendations',
    recommendationsGenerate: '/staffing/recommendations/generate',
    recommendationApply: (id: string) => `/staffing/recommendations/${id}/apply`,
    recommendationDismiss: (id: string) => `/staffing/recommendations/${id}/dismiss`,
  },
} as const
