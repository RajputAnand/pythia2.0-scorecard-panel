export type UserRole = 'employee' | 'owner' | 'manager' | 'superadmin'

export interface Store {
  id: string
  name: string
  location: string
  nodesOnline?: number
}

export interface User {
  id?: string
  initials: string
  name: string
  email?: string
  role: UserRole
  token?: string
  pythia2Token?: string
  score?: number
  jobTitle?: string
  points: number
  first_login?: boolean
  tenantId?: string
  tenantName?: string
  tenantCode?: string
}
