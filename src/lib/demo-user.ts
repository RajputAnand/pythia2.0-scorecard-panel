export type UserRole = 'employee' | 'owner' | 'manager'

export interface DemoUser {
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

/**
 * Change `role` here to test different sidebar layouts and page access:
 *   'employee' — shows employee nav + employee pill
 *   'owner'    — shows owner nav + view toggle + store pill
 *   'manager'  — same nav as owner but labelled manager
 */
export const DEMO_USER: DemoUser = {
  initials: 'MR',
  name: 'Marcus R.',
  role: 'manager',
  score: 84,
  jobTitle: 'Cashier',
  storeName: 'Main St. Store',
  storeLoc: 'Boise, ID',
  nodesOnline: 2,
}
