import type { Store } from '@/types/store'

/**
 * Empty default store list. Live stores are fetched dynamically via
 * GET /stores and managed in useUserStore.
 */
export const STORES: Store[] = []
