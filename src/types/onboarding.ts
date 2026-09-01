import type { Tenant, TenantChecklist, TenantStore } from './tenant'
import type { TenantOwner } from './owner'

export interface CsvStoreRow {
  storeNo: string
  name: string
  location: string
  district: string
  street?: string
  city?: string
  state?: string
  zip?: string
  timezone?: string
}

export interface CsvEmployeeRow {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  storeNo: string
  role?: string
}

export interface OnboardingWizardState {
  tenant: Tenant | null
  stores: TenantStore[]
  owners: TenantOwner[]
  step: number
  checklist: TenantChecklist
}

