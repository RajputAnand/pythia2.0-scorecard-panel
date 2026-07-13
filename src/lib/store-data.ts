import type { Store } from '@/types/store'

// Hardcoded — the auth backend no longer issues a token the legacy stores
// endpoint (`/stores/all/mine` on Pythia-1) accepts, so store selection is
// seeded from static data until a stores endpoint exists on the unified backend.
export const STORES: Store[] = [
  {
    _id: '69c19e66a27efce5858b6487',
    name: 'Lionmart Store',
    storeNo: 'LM-001',
    location: 'Downtown',
    district: 'Central',
    createdBy: 'system',
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    __v: 0,
  },
]
