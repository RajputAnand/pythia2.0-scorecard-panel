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
  // Employee-specific
  score?: number
  jobTitle?: string
  // Owner/Manager-specific
  storeName?: string
  storeLoc?: string
  nodesOnline?: number
  /** Owner-only: full list of stores returned by the login API */
  stores?: Store[]
}
