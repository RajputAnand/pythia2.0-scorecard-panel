// ---------------------------------------------------------------------------
// Fake API layer for Multi-Tenant, Onboarding, Owner, and Store Management
// State is held in-memory for the session to support full UI interaction.
// ---------------------------------------------------------------------------

import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type {
  Tenant,
  TenantStore,
  CreateTenantParams,
  CreateStoreParams,
  BulkCreateStoresParams,
  TenantStatus,
  TenantChecklist,
} from '@/types/tenant'
import type {
  TenantOwner,
  CreateOwnerParams,
  CreateOwnerResponse,
  OwnerCredentials,
} from '@/types/owner'

const delay = <T>(value: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms))

function randomCode(prefix = 'PYTH'): string {
  const seg1 = Math.floor(1000 + Math.random() * 9000)
  const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${seg1}-${seg2}`
}

function randomPassword(): string {
  return Math.random().toString(36).slice(2, 6) + '-' + Math.random().toString(36).slice(2, 6)
}

// ---------------------------------------------------------------------------
// Seed Data: Tenants
// ---------------------------------------------------------------------------
export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'ten_lionmart',
    code: 'lionmart',
    name: 'Lionmart Retail Group',
    status: 'active',
    plan: 'enterprise',
    storeAllowance: 25,
    primaryContact: {
      name: 'Arthur Pendelton',
      email: 'arthur@lionmart.com',
      phone: '+1 555-0199',
    },
    defaultTimezone: 'America/New_York',
    defaultLocale: 'en-US',
    createdAt: '2026-01-15T09:00:00Z',
    checklist: {
      tenantDetailsCaptured: true,
      storesCreated: true,
      devicesPaired: true,
      ownerCreated: true,
      ownerActivated: true,
      managersCreated: true,
      employeesOnboarded: true,
      firstScoresReceived: true,
    },
    stats: {
      storeCount: 5,
      ownerCount: 2,
      managerCount: 6,
      employeeCount: 44,
    },
    currentOnboardingStep: 6,
  },
  {
    id: 'ten_starcoffee',
    code: 'star-coffee',
    name: 'Star Coffee Roasters',
    status: 'active',
    plan: 'growth',
    storeAllowance: 10,
    primaryContact: {
      name: 'Elena Vance',
      email: 'elena@starcoffee.com',
      phone: '+1 555-0144',
    },
    defaultTimezone: 'America/Chicago',
    defaultLocale: 'en-US',
    createdAt: '2026-02-01T11:30:00Z',
    checklist: {
      tenantDetailsCaptured: true,
      storesCreated: true,
      devicesPaired: true,
      ownerCreated: true,
      ownerActivated: true,
      managersCreated: true,
      employeesOnboarded: true,
      firstScoresReceived: true,
    },
    stats: {
      storeCount: 2,
      ownerCount: 1,
      managerCount: 2,
      employeeCount: 9,
    },
    currentOnboardingStep: 6,
  },
  {
    id: 'ten_apexretail',
    code: 'apex-retail',
    name: 'Apex Supermarkets',
    status: 'onboarding',
    plan: 'standard',
    storeAllowance: 5,
    primaryContact: {
      name: 'Marcus Vance',
      email: 'marcus@apexretail.com',
      phone: '+1 555-0177',
    },
    defaultTimezone: 'America/Los_Angeles',
    defaultLocale: 'en-US',
    createdAt: '2026-08-20T14:00:00Z',
    checklist: {
      tenantDetailsCaptured: true,
      storesCreated: true,
      devicesPaired: false,
      ownerCreated: true,
      ownerActivated: false,
      managersCreated: false,
      employeesOnboarded: false,
      firstScoresReceived: false,
    },
    stats: {
      storeCount: 2,
      ownerCount: 1,
      managerCount: 0,
      employeeCount: 0,
    },
    currentOnboardingStep: 2,
  },
  {
    id: 'ten_greengrocer',
    code: 'green-grocer',
    name: 'Green Grocer Market',
    status: 'suspended',
    plan: 'standard',
    storeAllowance: 5,
    primaryContact: {
      name: 'Chloe Evans',
      email: 'chloe@greengrocer.com',
      phone: '+1 555-0123',
    },
    defaultTimezone: 'America/Denver',
    defaultLocale: 'en-US',
    createdAt: '2026-03-10T16:00:00Z',
    checklist: {
      tenantDetailsCaptured: true,
      storesCreated: true,
      devicesPaired: true,
      ownerCreated: true,
      ownerActivated: true,
      managersCreated: true,
      employeesOnboarded: true,
      firstScoresReceived: false,
    },
    stats: {
      storeCount: 1,
      ownerCount: 1,
      managerCount: 1,
      employeeCount: 5,
    },
    currentOnboardingStep: 6,
  },
]

// ---------------------------------------------------------------------------
// Seed Data: Stores
// ---------------------------------------------------------------------------
export const INITIAL_STORES: TenantStore[] = [
  {
    _id: 'STORE-001',
    id: 'STORE-001',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    storeNo: 'STORE-001',
    name: 'Store 001',
    location: 'Northside',
    district: 'Central',
    address: { street: '100 North Blvd', city: 'New York', state: 'NY', zip: '10001', fullAddress: '100 North Blvd, Floor 2, New York, NY 10001' },
    fullAddress: '100 North Blvd, Floor 2, New York, NY 10001',
    timezone: 'America/New_York',
    status: 'live',
    is_active: true,
    pairingCode: 'LM-PAIR-8801',
    lastHeartbeat: '2026-09-01T11:45:00Z',
    nodesOnline: 3,
    managerCount: 2,
    employeeCount: 14,
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    _id: 'STORE-002',
    id: 'STORE-002',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    storeNo: 'STORE-002',
    name: 'Store 002',
    location: 'Uptown',
    district: 'Central',
    address: { street: '240 Madison Ave', city: 'New York', state: 'NY', zip: '10016', fullAddress: '240 Madison Ave, Suite 300, New York, NY 10016' },
    fullAddress: '240 Madison Ave, Suite 300, New York, NY 10016',
    timezone: 'America/New_York',
    status: 'live',
    is_active: true,
    pairingCode: 'LM-PAIR-8802',
    lastHeartbeat: '2026-09-01T11:50:00Z',
    nodesOnline: 2,
    managerCount: 1,
    employeeCount: 9,
    createdAt: '2026-01-16T10:00:00Z',
  },
  {
    _id: 'STORE-003',
    id: 'STORE-003',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    storeNo: 'STORE-003',
    name: 'Store 003',
    location: 'Westside',
    district: 'Central',
    address: { street: '780 8th Ave', city: 'New York', state: 'NY', zip: '10036', fullAddress: '780 8th Ave, Retail Level 1, New York, NY 10036' },
    fullAddress: '780 8th Ave, Retail Level 1, New York, NY 10036',
    timezone: 'America/New_York',
    status: 'live',
    is_active: true,
    pairingCode: 'LM-PAIR-8803',
    lastHeartbeat: '2026-09-01T11:40:00Z',
    nodesOnline: 2,
    managerCount: 1,
    employeeCount: 8,
    createdAt: '2026-01-17T10:00:00Z',
  },
  {
    _id: 'STORE-101',
    id: 'STORE-101',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    storeNo: 'STORE-101',
    name: 'Store 101',
    location: 'Eastgate',
    district: 'Metro',
    address: { street: '450 East River Rd', city: 'Queens', state: 'NY', zip: '11101', fullAddress: '450 East River Rd, Building C, Queens, NY 11101' },
    fullAddress: '450 East River Rd, Building C, Queens, NY 11101',
    timezone: 'America/New_York',
    status: 'live',
    is_active: true,
    pairingCode: 'LM-PAIR-8804',
    lastHeartbeat: '2026-09-01T11:52:00Z',
    nodesOnline: 1,
    managerCount: 1,
    employeeCount: 6,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    _id: 'STORE-102',
    id: 'STORE-102',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    storeNo: 'STORE-102',
    name: 'Store 102',
    location: 'Riverside',
    district: 'Metro',
    address: { street: '512 Riverside Dr', city: 'New York', state: 'NY', zip: '10027', fullAddress: '512 Riverside Dr, New York, NY 10027' },
    fullAddress: '512 Riverside Dr, New York, NY 10027',
    timezone: 'America/New_York',
    status: 'live',
    is_active: true,
    pairingCode: 'LM-PAIR-8805',
    lastHeartbeat: '2026-09-01T11:48:00Z',
    nodesOnline: 2,
    managerCount: 1,
    employeeCount: 7,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    _id: 'SC-001',
    id: 'SC-001',
    tenantId: 'ten_starcoffee',
    tenantName: 'Star Coffee Roasters',
    storeNo: 'SC-001',
    name: 'Downtown Roastery',
    location: 'Downtown',
    district: 'East',
    address: { street: '12 Michigan Ave', city: 'Chicago', state: 'IL', zip: '60601', fullAddress: '12 Michigan Ave, Chicago, IL 60601' },
    fullAddress: '12 Michigan Ave, Chicago, IL 60601',
    timezone: 'America/Chicago',
    status: 'live',
    is_active: true,
    pairingCode: 'SC-PAIR-1001',
    lastHeartbeat: '2026-09-01T11:35:00Z',
    nodesOnline: 2,
    managerCount: 1,
    employeeCount: 5,
    createdAt: '2026-02-02T10:00:00Z',
  },
  {
    _id: 'SC-002',
    id: 'SC-002',
    tenantId: 'ten_starcoffee',
    tenantName: 'Star Coffee Roasters',
    storeNo: 'SC-002',
    name: 'Airport Terminal 2',
    location: 'Airport',
    district: 'North',
    address: { street: '10000 O\'Hare Way', city: 'Chicago', state: 'IL', zip: '60666', fullAddress: '10000 O\'Hare Way, Gate B12, Chicago, IL 60666' },
    fullAddress: '10000 O\'Hare Way, Gate B12, Chicago, IL 60666',
    timezone: 'America/Chicago',
    status: 'provisioning',
    is_active: true,
    pairingCode: 'SC-PAIR-1002',
    lastHeartbeat: null,
    nodesOnline: 0,
    managerCount: 1,
    employeeCount: 4,
    createdAt: '2026-02-05T10:00:00Z',
  },
  {
    _id: 'APEX-01',
    id: 'APEX-01',
    tenantId: 'ten_apexretail',
    tenantName: 'Apex Supermarkets',
    storeNo: 'APEX-01',
    name: 'Apex Main',
    location: 'Central Square',
    district: 'West',
    address: { street: '500 Market St', city: 'San Francisco', state: 'CA', zip: '94105', fullAddress: '500 Market St, San Francisco, CA 94105' },
    fullAddress: '500 Market St, San Francisco, CA 94105',
    timezone: 'America/Los_Angeles',
    status: 'provisioning',
    is_active: true,
    pairingCode: 'APEX-PAIR-9001',
    lastHeartbeat: null,
    nodesOnline: 0,
    managerCount: 0,
    employeeCount: 0,
    createdAt: '2026-08-21T10:00:00Z',
  },
  {
    _id: 'APEX-02',
    id: 'APEX-02',
    tenantId: 'ten_apexretail',
    tenantName: 'Apex Supermarkets',
    storeNo: 'APEX-02',
    name: 'Apex Harbor',
    location: 'Pier 39',
    district: 'Coastal',
    address: { street: 'Beach St & The Embarcadero', city: 'San Francisco', state: 'CA', zip: '94133', fullAddress: 'Beach St & The Embarcadero, Suite 10, San Francisco, CA 94133' },
    fullAddress: 'Beach St & The Embarcadero, Suite 10, San Francisco, CA 94133',
    timezone: 'America/Los_Angeles',
    status: 'provisioning',
    is_active: true,
    pairingCode: 'APEX-PAIR-9002',
    lastHeartbeat: null,
    nodesOnline: 0,
    managerCount: 0,
    employeeCount: 0,
    createdAt: '2026-08-21T10:00:00Z',
  },
]

export const INITIAL_DEACTIVATED_STORES: TenantStore[] = [
  {
    _id: 'STORE-099',
    id: 'STORE-099',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    storeNo: 'STORE-099',
    name: 'Old Port Flagship',
    location: 'Historic Port',
    district: 'Waterfront',
    address: { street: '12 Harbor Way', city: 'Brooklyn', state: 'NY', zip: '11201', fullAddress: '12 Harbor Way, Pier 4, Brooklyn, NY 11201' },
    fullAddress: '12 Harbor Way, Pier 4, Brooklyn, NY 11201',
    timezone: 'America/New_York',
    status: 'offline',
    is_active: false,
    pairingCode: 'LM-PAIR-8099',
    lastHeartbeat: '2026-07-20T10:00:00Z',
    nodesOnline: 0,
    managerCount: 0,
    employeeCount: 0,
    createdAt: '2025-11-10T10:00:00Z',
    deactivated_at: '2026-08-01T14:30:00Z',
    deactivated_by: 'owner@demo.com',
  },
]

// ---------------------------------------------------------------------------
// Seed Data: Owners
// ---------------------------------------------------------------------------
export const INITIAL_OWNERS: TenantOwner[] = [
  {
    _id: 'OWN-101',
    id: 'OWN-101',
    user_id: 'OWN-101',
    first_name: 'Sam',
    last_name: 'B.',
    firstName: 'Sam',
    lastName: 'B.',
    email: 'owner@demo.com',
    phone: '+1 555-0111',
    role_name: 'owner',
    tenant_id: 'ten_lionmart',
    tenant_name: 'Lionmart Retail Group',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    store_ids: ['STORE-001', 'STORE-002', 'STORE-003', 'STORE-101', 'STORE-102'],
    storeIds: ['STORE-001', 'STORE-002', 'STORE-003', 'STORE-101', 'STORE-102'],
    status: 'active',
    is_active: true,
    must_change_password: false,
    created_at: '2026-01-16T10:00:00Z',
    last_login: '2026-09-01T09:15:00Z',
  },
  {
    _id: 'OWN-102',
    id: 'OWN-102',
    user_id: 'OWN-102',
    first_name: 'Diana',
    last_name: 'Prince',
    firstName: 'Diana',
    lastName: 'Prince',
    email: 'diana.prince@lionmart.com',
    phone: '+1 555-0119',
    role_name: 'owner',
    tenant_id: 'ten_lionmart',
    tenant_name: 'Lionmart Retail Group',
    tenantId: 'ten_lionmart',
    tenantName: 'Lionmart Retail Group',
    store_ids: ['STORE-101', 'STORE-102'],
    storeIds: ['STORE-101', 'STORE-102'],
    status: 'active',
    is_active: true,
    must_change_password: false,
    created_at: '2026-01-20T10:00:00Z',
    last_login: '2026-08-28T14:30:00Z',
  },
  {
    _id: 'OWN-201',
    id: 'OWN-201',
    user_id: 'OWN-201',
    first_name: 'Elena',
    last_name: 'Vance',
    firstName: 'Elena',
    lastName: 'Vance',
    email: 'owner@starcoffee.com',
    phone: '+1 555-0144',
    role_name: 'owner',
    tenant_id: 'ten_starcoffee',
    tenant_name: 'Star Coffee Roasters',
    tenantId: 'ten_starcoffee',
    tenantName: 'Star Coffee Roasters',
    store_ids: ['SC-001', 'SC-002'],
    storeIds: ['SC-001', 'SC-002'],
    status: 'active',
    is_active: true,
    must_change_password: false,
    created_at: '2026-02-02T10:00:00Z',
    last_login: '2026-08-30T16:00:00Z',
  },
  {
    _id: 'OWN-301',
    id: 'OWN-301',
    user_id: 'OWN-301',
    first_name: 'Marcus',
    last_name: 'Vance',
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'owner@apexretail.com',
    phone: '+1 555-0177',
    role_name: 'owner',
    tenant_id: 'ten_apexretail',
    tenant_name: 'Apex Supermarkets',
    tenantId: 'ten_apexretail',
    tenantName: 'Apex Supermarkets',
    store_ids: ['APEX-01', 'APEX-02'],
    storeIds: ['APEX-01', 'APEX-02'],
    status: 'invited',
    is_active: true,
    must_change_password: true,
    created_at: '2026-08-21T10:00:00Z',
    last_login: null,
  },
]

// Mutable module-level store collections for session lifecycle
const tenants: Tenant[] = INITIAL_TENANTS.map((t) => ({ ...t, checklist: { ...t.checklist }, stats: { ...t.stats } }))
const stores: TenantStore[] = INITIAL_STORES.map((s) => ({ ...s, address: { ...s.address } }))
const deactivatedStores: TenantStore[] = INITIAL_DEACTIVATED_STORES.map((s) => ({ ...s, address: { ...s.address } }))
const owners: TenantOwner[] = INITIAL_OWNERS.map((o) => ({ ...o, store_ids: [...o.store_ids], storeIds: [...(o.storeIds || o.store_ids)] }))
const archivedOwners: TenantOwner[] = []

const tempPasswords = new Map<string, string>()
tempPasswords.set('OWN-301', 'apex-temp-8492')

// ---------------------------------------------------------------------------
// Tenant API Operations
// ---------------------------------------------------------------------------

export function fakeListTenants(params?: {
  search?: string
  status?: string
  skip?: number
  limit?: number
}): Promise<ApiResponseV2Paginated<Tenant[]>> {
  const { search = '', status, skip = 0, limit = 15 } = params || {}
  const term = search.trim().toLowerCase()

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      !term ||
      t.name.toLowerCase().includes(term) ||
      t.code.toLowerCase().includes(term) ||
      t.primaryContact.name.toLowerCase().includes(term) ||
      t.primaryContact.email.toLowerCase().includes(term)
    const matchesStatus = !status || status === 'all' || t.status === status
    return matchesSearch && matchesStatus
  })

  const page = filtered.slice(skip, skip + limit)
  return delay({
    success: true,
    meta: { total: filtered.length, skip, limit },
    data: page.map((t) => ({ ...t })),
  })
}

export function fakeGetTenant(idOrCode: string): Promise<ApiResponseV2<Tenant>> {
  const tenant = tenants.find((t) => t.id === idOrCode || t.code === idOrCode)
  if (!tenant) {
    return Promise.reject({
      response: { status: 404, data: { detail: 'Tenant not found.' } },
      isAxiosError: true,
    })
  }
  return delay({ success: true, data: { ...tenant } })
}

export function fakeCreateTenant(params: CreateTenantParams): Promise<ApiResponseV2<Tenant>> {
  const existing = tenants.find((t) => t.code === params.code.toLowerCase())
  if (existing) {
    return Promise.reject({
      response: { status: 409, data: { detail: `Tenant with identifier "${params.code}" already exists.` } },
      isAxiosError: true,
    })
  }

  const id = `ten_${params.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  const newTenant: Tenant = {
    id,
    code: params.code.toLowerCase(),
    name: params.name,
    status: 'onboarding',
    plan: params.plan,
    storeAllowance: params.storeAllowance,
    primaryContact: {
      name: params.primaryContactName,
      email: params.primaryContactEmail,
      phone: params.primaryContactPhone || null,
    },
    defaultTimezone: params.defaultTimezone,
    defaultLocale: params.defaultLocale,
    createdAt: new Date().toISOString(),
    checklist: {
      tenantDetailsCaptured: true,
      storesCreated: false,
      devicesPaired: false,
      ownerCreated: false,
      ownerActivated: false,
      managersCreated: false,
      employeesOnboarded: false,
      firstScoresReceived: false,
    },
    stats: {
      storeCount: 0,
      ownerCount: 0,
      managerCount: 0,
      employeeCount: 0,
    },
    currentOnboardingStep: 2,
  }

  tenants.unshift(newTenant)
  return delay({ success: true, data: { ...newTenant } })
}

export function fakeUpdateTenantStatus(tenantId: string, status: TenantStatus): Promise<ApiResponseV2<Tenant>> {
  const idx = tenants.findIndex((t) => t.id === tenantId)
  if (idx === -1) {
    return Promise.reject({
      response: { status: 404, data: { detail: 'Tenant not found.' } },
      isAxiosError: true,
    })
  }
  tenants[idx].status = status
  tenants[idx].updatedAt = new Date().toISOString()
  return delay({ success: true, data: { ...tenants[idx] } })
}

export function fakeUpdateTenantChecklist(
  tenantId: string,
  partial: Partial<TenantChecklist>,
  step?: number
): Promise<ApiResponseV2<Tenant>> {
  const idx = tenants.findIndex((t) => t.id === tenantId)
  if (idx === -1) {
    return Promise.reject({
      response: { status: 404, data: { detail: 'Tenant not found.' } },
      isAxiosError: true,
    })
  }
  tenants[idx].checklist = { ...tenants[idx].checklist, ...partial }
  if (step != null) tenants[idx].currentOnboardingStep = step
  tenants[idx].updatedAt = new Date().toISOString()
  return delay({ success: true, data: { ...tenants[idx] } })
}

// ---------------------------------------------------------------------------
// Store API Operations
// ---------------------------------------------------------------------------

export function fakeListStores(params?: {
  tenantId?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
}): Promise<ApiResponseV2Paginated<TenantStore[]>> {
  const { tenantId, search = '', status, skip = 0, limit = 20 } = params || {}
  const term = search.trim().toLowerCase()

  const filtered = stores.filter((s) => {
    const matchesTenant = !tenantId || tenantId === 'all' || s.tenantId === tenantId
    const matchesSearch =
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.storeNo.toLowerCase().includes(term) ||
      s.location.toLowerCase().includes(term) ||
      s.district.toLowerCase().includes(term) ||
      (s.fullAddress || '').toLowerCase().includes(term) ||
      (s.pairingCode || '').toLowerCase().includes(term)
    const matchesStatus = !status || status === 'all' || s.status === status
    return matchesTenant && matchesSearch && matchesStatus
  })

  const page = filtered.slice(skip, skip + limit)
  return delay({
    success: true,
    meta: { total: filtered.length, skip, limit },
    data: page.map((s) => ({ ...s })),
  })
}

export function fakeListDeactivatedStores(params?: {
  tenantId?: string
  search?: string
  skip?: number
  limit?: number
}): Promise<ApiResponseV2Paginated<TenantStore[]>> {
  const { tenantId, search = '', skip = 0, limit = 20 } = params || {}
  const term = search.trim().toLowerCase()

  const filtered = deactivatedStores.filter((s) => {
    const matchesTenant = !tenantId || tenantId === 'all' || s.tenantId === tenantId
    const matchesSearch =
      !term ||
      s.name.toLowerCase().includes(term) ||
      s.storeNo.toLowerCase().includes(term) ||
      s.location.toLowerCase().includes(term) ||
      s.district.toLowerCase().includes(term) ||
      (s.fullAddress || '').toLowerCase().includes(term) ||
      (s.pairingCode || '').toLowerCase().includes(term)
    return matchesTenant && matchesSearch
  })

  const page = filtered.slice(skip, skip + limit)
  return delay({
    success: true,
    meta: { total: filtered.length, skip, limit },
    data: page.map((s) => ({ ...s })),
  })
}

export function fakeDeactivateStore(storeId: string): Promise<ApiResponseV2<TenantStore>> {
  const idx = stores.findIndex((s) => s.id === storeId || s._id === storeId)
  if (idx === -1) {
    return Promise.reject({
      response: { status: 404, data: { detail: 'Store not found in active list.' } },
      isAxiosError: true,
    })
  }

  const [removed] = stores.splice(idx, 1)
  const deactivatedRecord: TenantStore = {
    ...removed,
    status: 'offline',
    is_active: false,
    deactivated_at: new Date().toISOString(),
    deactivated_by: 'owner@demo.com',
  }
  deactivatedStores.unshift(deactivatedRecord)

  const tenant = tenants.find((t) => t.id === removed.tenantId)
  if (tenant) {
    tenant.stats.storeCount = Math.max(0, tenant.stats.storeCount - 1)
  }

  return delay({ success: true, data: { ...deactivatedRecord } })
}

export function fakeActivateStore(storeId: string): Promise<ApiResponseV2<TenantStore>> {
  const idx = deactivatedStores.findIndex((s) => s.id === storeId || s._id === storeId)
  if (idx === -1) {
    return Promise.reject({
      response: { status: 404, data: { detail: 'Store not found in deactivated list.' } },
      isAxiosError: true,
    })
  }

  const [removed] = deactivatedStores.splice(idx, 1)
  const activatedRecord: TenantStore = {
    ...removed,
    status: 'live',
    is_active: true,
    deactivated_at: null,
    deactivated_by: null,
    updatedAt: new Date().toISOString(),
  }
  stores.unshift(activatedRecord)

  const tenant = tenants.find((t) => t.id === removed.tenantId)
  if (tenant) {
    tenant.stats.storeCount += 1
  }

  return delay({ success: true, data: { ...activatedRecord } })
}

export function fakeCreateStore(params: CreateStoreParams): Promise<ApiResponseV2<TenantStore>> {
  const tenant = params.tenantId ? tenants.find((t) => t.id === params.tenantId) : tenants[0]
  const tenantId = tenant?.id || 'ten_lionmart'
  const pairingCode = params.pairingCode || randomCode('PAIR')
  const fullAddress =
    params.fullAddress ||
    (params.street
      ? `${params.street}, ${params.city || ''}, ${params.state || ''} ${params.zip || ''}`.trim()
      : `${params.location}, ${params.district}`)

  const newStore: TenantStore = {
    _id: params.storeNo,
    id: params.storeNo,
    tenantId,
    tenantName: tenant?.name ?? 'Lionmart Retail Group',
    storeNo: params.storeNo,
    name: params.name,
    location: params.location,
    district: params.district,
    address: {
      street: params.street,
      city: params.city,
      state: params.state,
      zip: params.zip,
      fullAddress,
    },
    fullAddress,
    timezone: params.timezone || 'America/New_York',
    status: 'provisioning',
    is_active: true,
    pairingCode,
    lastHeartbeat: null,
    nodesOnline: 0,
    managerCount: 0,
    employeeCount: 0,
    createdAt: new Date().toISOString(),
  }

  stores.unshift(newStore)
  if (tenant) {
    tenant.stats.storeCount += 1
    tenant.checklist.storesCreated = true
  }

  return delay({ success: true, data: { ...newStore } })
}

export function fakeBulkCreateStores(params: BulkCreateStoresParams): Promise<ApiResponseV2<TenantStore[]>> {
  const tenant = tenants.find((t) => t.id === params.tenantId)
  const createdList: TenantStore[] = []

  for (const s of params.stores) {
    const pairingCode = randomCode('PAIR')
    const fullAddress = `${s.street || ''}, ${s.city || ''}, ${s.state || ''} ${s.zip || ''}`.trim() || `${s.location}, ${s.district}`
    const record: TenantStore = {
      _id: s.storeNo,
      id: s.storeNo,
      tenantId: params.tenantId,
      tenantName: tenant?.name ?? 'Tenant',
      storeNo: s.storeNo,
      name: s.name,
      location: s.location,
      district: s.district,
      address: {
        street: s.street,
        city: s.city,
        state: s.state,
        zip: s.zip,
        fullAddress,
      },
      fullAddress,
      timezone: s.timezone,
      status: 'provisioning',
      is_active: true,
      pairingCode,
      lastHeartbeat: null,
      nodesOnline: 0,
      managerCount: 0,
      employeeCount: 0,
      createdAt: new Date().toISOString(),
    }
    stores.unshift(record)
    createdList.push(record)
  }

  if (tenant) {
    tenant.stats.storeCount += createdList.length
    tenant.checklist.storesCreated = true
  }

  return delay({ success: true, data: createdList })
}

export function fakeSimulateHeartbeat(storeId: string): Promise<ApiResponseV2<TenantStore>> {
  const idx = stores.findIndex((s) => s.id === storeId || s._id === storeId)
  if (idx === -1) {
    return Promise.reject({
      response: { status: 404, data: { detail: 'Store not found.' } },
      isAxiosError: true,
    })
  }

  stores[idx].status = 'live'
  stores[idx].lastHeartbeat = new Date().toISOString()
  stores[idx].nodesOnline = Math.max(1, (stores[idx].nodesOnline || 0) + 1)

  const tenant = tenants.find((t) => t.id === stores[idx].tenantId)
  if (tenant) {
    const tenantStores = stores.filter((s) => s.tenantId === tenant.id)
    const allLive = tenantStores.length > 0 && tenantStores.every((s) => s.status === 'live')
    if (allLive) {
      tenant.checklist.devicesPaired = true
    }
  }

  return delay({ success: true, data: { ...stores[idx] } })
}

export function fakeUpdateStore(
  storeId: string,
  updates: Partial<TenantStore>
): Promise<ApiResponseV2<TenantStore>> {
  const idx = stores.findIndex((s) => s.id === storeId || s._id === storeId)
  if (idx !== -1) {
    stores[idx] = { ...stores[idx], ...updates, updatedAt: new Date().toISOString() }
    return delay({ success: true, data: { ...stores[idx] } })
  }

  const deactIdx = deactivatedStores.findIndex((s) => s.id === storeId || s._id === storeId)
  if (deactIdx !== -1) {
    deactivatedStores[deactIdx] = { ...deactivatedStores[deactIdx], ...updates, updatedAt: new Date().toISOString() }
    return delay({ success: true, data: { ...deactivatedStores[deactIdx] } })
  }

  return Promise.reject({
    response: { status: 404, data: { detail: 'Store not found.' } },
    isAxiosError: true,
  })
}

// ---------------------------------------------------------------------------
// Owner API Operations (Super Admin and Tenant Scope)
// ---------------------------------------------------------------------------

export function fakeListOwners(params?: {
  tenantId?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
}): Promise<ApiResponseV2Paginated<TenantOwner[]>> {
  const { tenantId, search = '', status, skip = 0, limit = 15 } = params || {}
  const term = search.trim().toLowerCase()

  const filtered = owners.filter((o) => {
    const matchesTenant = !tenantId || o.tenant_id === tenantId || o.tenantId === tenantId
    const name = `${o.first_name || ''} ${o.last_name || ''}`.toLowerCase()
    const matchesSearch =
      !term ||
      name.includes(term) ||
      o.email.toLowerCase().includes(term) ||
      o.user_id.toLowerCase().includes(term) ||
      (o.tenant_name || '').toLowerCase().includes(term)
    const matchesStatus = !status || status === 'all' || o.status === status
    return matchesTenant && matchesSearch && matchesStatus
  })

  const page = filtered.slice(skip, skip + limit)
  return delay({
    success: true,
    meta: { total: filtered.length, skip, limit },
    data: page.map((o) => ({ ...o })),
  })
}

export function fakeListArchivedOwners(params?: {
  tenantId?: string
  search?: string
  skip?: number
  limit?: number
}): Promise<ApiResponseV2Paginated<TenantOwner[]>> {
  const { tenantId, search = '', skip = 0, limit = 15 } = params || {}
  const term = search.trim().toLowerCase()

  const filtered = archivedOwners.filter((o) => {
    const matchesTenant = !tenantId || o.tenant_id === tenantId
    const name = `${o.first_name || ''} ${o.last_name || ''}`.toLowerCase()
    return matchesTenant && (!term || name.includes(term) || o.email.toLowerCase().includes(term))
  })

  const page = filtered.slice(skip, skip + limit)
  return delay({
    success: true,
    meta: { total: filtered.length, skip, limit },
    data: page.map((o) => ({ ...o })),
  })
}

export function fakeCreateOwner(params: CreateOwnerParams): Promise<CreateOwnerResponse> {
  const tenant = tenants.find((t) => t.id === params.tenantId || t.code === params.tenantId)
  const tenantId = tenant?.id ?? params.tenantId
  const tenantName = tenant?.name ?? 'Tenant'

  const userId = `OWN-${Math.floor(1000 + Math.random() * 9000)}`
  const tempPassword = randomPassword()

  const newOwner: TenantOwner = {
    _id: userId,
    id: userId,
    user_id: userId,
    first_name: params.firstName,
    last_name: params.lastName,
    firstName: params.firstName,
    lastName: params.lastName,
    email: params.email,
    phone: params.phone || null,
    role_name: 'owner',
    tenant_id: tenantId,
    tenant_name: tenantName,
    tenantId: tenantId,
    tenantName: tenantName,
    store_ids: params.storeIds,
    storeIds: params.storeIds,
    status: 'invited',
    is_active: true,
    must_change_password: true,
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    last_login: null,
  }

  owners.unshift(newOwner)
  tempPasswords.set(userId, tempPassword)

  if (tenant) {
    tenant.stats.ownerCount += 1
    tenant.checklist.ownerCreated = true
  }

  return delay({
    success: true,
    user_id: userId,
    temp_password: tempPassword,
    email_sent: true,
    message: 'Owner created successfully and welcome email queued.',
  })
}

export function fakeGetOwnerCredentials(userId: string): Promise<OwnerCredentials> {
  let tempPassword = tempPasswords.get(userId)
  if (!tempPassword) {
    const owner = owners.find((o) => o.user_id === userId)
    if (owner?.must_change_password || owner?.status === 'invited') {
      tempPassword = 'own-temp-' + Math.random().toString(36).slice(2, 6)
      tempPasswords.set(userId, tempPassword)
    } else {
      return Promise.reject({
        response: { status: 409, data: { detail: 'No recoverable temporary password on file. Password has already been set.' } },
        isAxiosError: true,
      })
    }
  }
  return delay({ user_id: userId, temp_password: tempPassword })
}

export function fakeArchiveOwner(userId: string): Promise<void> {
  const idx = owners.findIndex((o) => o.user_id === userId)
  if (idx !== -1) {
    const [record] = owners.splice(idx, 1)
    archivedOwners.unshift({
      ...record,
      status: 'archived',
      is_active: false,
      archived_by: 'superadmin@pythia.com',
      archived_at: new Date().toISOString(),
    })
  }
  return delay(undefined)
}

export function fakeUnarchiveOwner(userId: string): Promise<void> {
  const idx = archivedOwners.findIndex((o) => o.user_id === userId)
  if (idx !== -1) {
    const [record] = archivedOwners.splice(idx, 1)
    owners.unshift({
      ...record,
      status: 'active',
      is_active: true,
      archived_by: null,
      archived_at: null,
    })
  }
  return delay(undefined)
}

// ---------------------------------------------------------------------------
// Multi-Tenant Login Resolver (Mock)
// ---------------------------------------------------------------------------
export interface TenantLoginResult {
  success: boolean
  user?: {
    id: string
    email: string
    name: string
    role: string
    initials: string
    token: string
    refreshToken: string
    tenantId: string
    tenantName: string
    tenantCode: string
    storeIds: string[]
    points: number
  }
  error?: string
}

export function fakeTenantLogin(
  orgId: string,
  identifier: string,
  _password: string,
  role: string
): Promise<TenantLoginResult> {
  const orgClean = orgId.trim().toLowerCase()
  const idClean = identifier.trim().toLowerCase()

  // Match tenant
  const tenant = tenants.find((t) => t.code === orgClean || t.id === orgClean || t.name.toLowerCase().includes(orgClean))
  if (!tenant) {
    return delay({
      success: false,
      error: `Organization "${orgId}" not found. Please check your Organization ID.`,
    })
  }

  if (tenant.status === 'suspended') {
    return delay({
      success: false,
      error: `This organization account has been suspended. Please contact your Pythia administrator.`,
    })
  }

  const token = `jwt_mock_${tenant.code}_${role}_${Date.now()}`

  let name = 'Demo User'
  let initials = 'DU'

  if (role === 'owner') {
    name = `${tenant.name} Owner`
    initials = 'OW'
  } else if (role === 'manager') {
    name = `${tenant.name} Manager`
    initials = 'MG'
  } else if (role === 'employee') {
    name = 'Marcus R.'
    initials = 'MR'
  } else if (role === 'superadmin') {
    name = 'Super Admin'
    initials = 'SA'
  }

  const tenantStoreIds = stores.filter((s) => s.tenantId === tenant.id).map((s) => s.id)

  return delay({
    success: true,
    user: {
      id: `usr_${Math.random().toString(36).slice(2, 9)}`,
      email: idClean.includes('@') ? idClean : `${idClean}@${tenant.code}.com`,
      name,
      role: role.toLowerCase(),
      initials,
      token,
      refreshToken: `${token}_refresh`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantCode: tenant.code,
      storeIds: tenantStoreIds,
      points: role === 'employee' ? 450 : 0,
    },
  })
}

