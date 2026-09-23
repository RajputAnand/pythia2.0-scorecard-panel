export interface Organization {
  _id: string
  tenant_id: string
  name: string
  status?: 'active' | 'parked' | 'archived' | string
  owner_user_id?: string
  stripe_customer_id?: string
  created_at?: string
  updated_at?: string
}

export interface OrganizationsResponse {
  organizations: Organization[]
  total: number
}

