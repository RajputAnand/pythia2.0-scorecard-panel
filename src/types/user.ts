export type UserRole = 'employee' | 'owner' | 'manager' | 'superadmin'

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
  pythia2Token?: string
  score?: number
  jobTitle?: string
  points: number
}
