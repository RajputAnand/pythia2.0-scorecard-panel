export interface OrganizationOwner {
  user_id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  role_name: string
  tenant_id: string
  is_active: boolean
  can_manage_subscription: boolean
  is_root_owner: boolean
  created_by?: string | null
  created_at?: string | null
}

export interface CreateSubOwnerParams {
  token?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  canManageSubscription?: boolean
}

export interface CreateSubOwnerResult {
  success: boolean
  user_id: string
  temp_password: string
  email_sent: boolean
  can_manage_subscription: boolean
}

export interface OwnerCredentialsResult {
  success: boolean
  user_id: string
  username: string
  temp_password: string
}

