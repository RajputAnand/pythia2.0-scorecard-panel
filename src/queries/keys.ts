// ---------------------------------------------------------------------------
// Query key factory — all keys are hierarchical so targeted invalidation works:
//   queryClient.invalidateQueries({ queryKey: queryKeys.swag.all })
//   invalidates swag.store() and any future swag.* keys.
// ---------------------------------------------------------------------------

export const queryKeys = {
  stores: {
    all: ['stores'] as const,
    // Keyed by token — a new login produces a new token, triggering a fresh fetch.
    list: (token = 'unauthenticated') => [...queryKeys.stores.all, 'list', token] as const,
  },

  swag: {
    all: ['swag'] as const,
    store: () => [...queryKeys.swag.all, 'store'] as const,
  },

  overview: {
    all: ['overview'] as const,
    dashboard: (storeId = 'default') =>
      [...queryKeys.overview.all, 'dashboard', storeId] as const,
  },

  coaching: {
    all: ['coaching'] as const,
    tracker: (managerId = 'default') =>
      [...queryKeys.coaching.all, 'tracker', managerId] as const,
  },

  leaderboard: {
    all: ['leaderboard'] as const,
    weekly: (weekId = 'current') =>
      [...queryKeys.leaderboard.all, 'weekly', weekId] as const,
  },

  staffing: {
    all: ['staffing'] as const,
    intelligence: (storeId = 'default') =>
      [...queryKeys.staffing.all, 'intelligence', storeId] as const,
  },

  employees: {
    all: ['employees'] as const,
    list: (params: { search?: string; skip?: number; limit?: number } = {}) =>
      [...queryKeys.employees.all, 'list', params] as const,
  },

  unknownIdentities: {
    all: ['unknownIdentities'] as const,
    // Single key for the whole infinite list — TanStack Query stores all
    // fetched pages under one cache entry keyed only by domain (+ token).
    infinite: (token = 'unauthenticated') =>
      [...queryKeys.unknownIdentities.all, 'infinite', token] as const,
  },

} as const
