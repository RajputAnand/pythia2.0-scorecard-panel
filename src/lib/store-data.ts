import type { Store } from '@/types/store'

// Hardcoded — the auth backend no longer issues a token the legacy stores
// endpoint (`/stores/all/mine` on Pythia-1) accepts, so store selection is
// seeded from static data until a stores endpoint exists on the unified backend.
//
// These `_id`s must match the store_id values the benchmarking backend knows
// about (seeded via pythia-2.0/scripts/seed_owner_benchmarking_data.py) so a
// store picked here lines up with GET /benchmarking/all_store_data rows.
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
  {
    _id: 'STORE-001',
    name: 'Store 001',
    storeNo: 'STORE-001',
    location: 'Northside',
    district: 'Central',
    createdBy: 'system',
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    __v: 0,
  },
  {
    _id: 'STORE-002',
    name: 'Store 002',
    storeNo: 'STORE-002',
    location: 'Uptown',
    district: 'Central',
    createdBy: 'system',
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    __v: 0,
  },
  {
    _id: 'STORE-003',
    name: 'Store 003',
    storeNo: 'STORE-003',
    location: 'Westside',
    district: 'Central',
    createdBy: 'system',
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    __v: 0,
  },
  {
    _id: 'STORE-101',
    name: 'Store 101',
    storeNo: 'STORE-101',
    location: 'Eastgate',
    district: 'Metro',
    createdBy: 'system',
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    __v: 0,
  },
  {
    _id: 'STORE-102',
    name: 'Store 102',
    storeNo: 'STORE-102',
    location: 'Riverside',
    district: 'Metro',
    createdBy: 'system',
    updatedBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    __v: 0,
  },
]
