export type StoreProvisionStatus = 'provisioning' | 'live' | 'offline' | 'closed'

export interface StoreAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  fullAddress?: string
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
  fullAddress?: string
  timezone: string
  status: StoreProvisionStatus
  is_active?: boolean
  pairingCode: string
  lastHeartbeat?: string | null
  nodesOnline?: number
  managerCount?: number
  employeeCount?: number
  createdAt: string
  updatedAt?: string
  deactivated_at?: string | null
  deactivated_by?: string | null
}

export interface CreateStoreParams {
  tenantId?: string
  storeNo: string
  name: string
  location: string
  district: string
  street?: string
  city?: string
  state?: string
  zip?: string
  fullAddress?: string
  pairingCode?: string
  timezone?: string
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

