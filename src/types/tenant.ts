export type TenantStatus = 'onboarding' | 'active' | 'suspended'
export type TenantPlan = 'standard' | 'growth' | 'enterprise' | 'custom'

export interface TenantContact {
  name: string
  email: string
  phone?: string | null
}

export interface TenantStats {
  storeCount: number
  ownerCount: number
  managerCount: number
  employeeCount: number
}

export interface TenantChecklist {
  tenantDetailsCaptured: boolean
  storesCreated: boolean
  devicesPaired: boolean
  ownerCreated: boolean
  ownerActivated: boolean
  managersCreated: boolean
  employeesOnboarded: boolean
  firstScoresReceived: boolean
}

export interface Tenant {
  id: string
  code: string // E.g. 'lionmart', 'star-coffee'
  name: string
  status: TenantStatus
  plan: TenantPlan
  storeAllowance: number
  primaryContact: TenantContact
  defaultTimezone: string
  defaultLocale: string
  createdAt: string
  updatedAt?: string
  checklist: TenantChecklist
  stats: TenantStats
  currentOnboardingStep?: number
}

export type StoreProvisionStatus = 'provisioning' | 'live' | 'offline' | 'closed'

export interface StoreAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
}

export interface TenantStore {
  _id: string
  id: string
  tenantId: string
  tenantName?: string
  storeNo: string
  name: string
  location: string
  district: string
  address?: StoreAddress
  timezone: string
  status: StoreProvisionStatus
  pairingCode: string
  lastHeartbeat?: string | null
  nodesOnline?: number
  managerCount?: number
  employeeCount?: number
  createdAt: string
  updatedAt?: string
}

export interface CreateTenantParams {
  name: string
  code: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone?: string
  plan: TenantPlan
  storeAllowance: number
  defaultTimezone: string
  defaultLocale: string
}

export interface CreateStoreParams {
  tenantId: string
  storeNo: string
  name: string
  location: string
  district: string
  street?: string
  city?: string
  state?: string
  zip?: string
  timezone: string
}

export interface BulkCreateStoresParams {
  tenantId: string
  stores: Array<{
    storeNo: string
    name: string
    location: string
    district: string
    street?: string
    city?: string
    state?: string
    zip?: string
    timezone: string
  }>
}

