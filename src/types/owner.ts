export interface TenantOwner {
  _id: string
  id: string
  user_id: string
  first_name?: string | null
  last_name?: string | null
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  role_name: 'owner'
  tenant_id: string
  tenant_name?: string
  tenantId?: string
  tenantName?: string
  store_ids: string[]
  storeIds?: string[]
  status: 'active' | 'invited' | 'archived'
  is_active: boolean
  must_change_password?: boolean
  created_at?: string
  createdAt?: string
  last_login?: string | null
  lastLogin?: string | null
  archived_by?: string | null
  archived_at?: string | null
}

export interface CreateOwnerParams {
  token: string
  tenantId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  storeIds: string[]
}

export interface CreateOwnerResponse {
  success: boolean
  user_id: string
  temp_password: string
  email_sent: boolean
  message: string
}

export interface OwnerCredentials {
  user_id: string
  temp_password: string
}

