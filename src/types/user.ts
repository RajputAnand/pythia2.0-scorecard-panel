export type UserRole = 'employee' | 'owner' | 'manager'

export interface Store {
  id: string
  name: string
  location: string
  nodesOnline?: number
}

export interface User {
  initials: string
  name: string
  role: UserRole
  token?: string
  score?: number
  jobTitle?: string
}
