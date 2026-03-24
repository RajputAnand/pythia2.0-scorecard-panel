export type UserRole = 'employee' | 'owner' | 'manager'

export interface User {
  initials: string
  name: string
  role: UserRole
  // Employee-specific
  score?: number
  jobTitle?: string
  // Owner/Manager-specific
  storeName?: string
  storeLoc?: string
  nodesOnline?: number
}
