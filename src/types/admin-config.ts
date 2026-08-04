export type KpiEntryType = 'card' | 'graph' | 'panel'

export type AdminRole = 'employee' | 'manager' | 'owner'

export interface KpiRegistryEntry {
  id: string
  label: string
  description: string
  role: AdminRole
  page: string
  pageHref: string
  type: KpiEntryType
}

/** One entry per sidebar-navigable page — the toggle that removes the page's
 * nav item from the Sidebar entirely (distinct from KpiRegistryEntry, which
 * toggles individual cards/graphs within a page). */
export interface PageRegistryEntry {
  id: string
  role: AdminRole
  page: string
  pageHref: string
}

export type KpiVisibilityMap = Record<string, boolean>
