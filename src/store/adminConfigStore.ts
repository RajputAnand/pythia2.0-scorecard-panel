import { create } from 'zustand'
import { fetchFieldConfigs, updateFieldConfig } from '@/queries/admin-config'
import { KPI_REGISTRY, PAGE_REGISTRY, ROLE_BY_FIELD_ID } from '@/lib/admin-config-data'
import type { AdminRole, KpiVisibilityMap } from '@/types/admin-config'

const ADMIN_ROLES: AdminRole[] = ['employee', 'manager', 'owner']

interface AdminConfigState {
  visibility: KpiVisibilityMap
  fieldsByRole: Partial<Record<AdminRole, Record<string, boolean>>>
  loading: boolean
  savingId: string | null
  error: string | null

  fetchVisibility: (token: string) => Promise<void>
  setCardVisibility: (id: string, visible: boolean, token: string) => Promise<boolean>
}

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  visibility: {},
  fieldsByRole: {},
  loading: false,
  savingId: null,
  error: null,

  async fetchVisibility(token) {
    set({ loading: true, error: null })
    try {
      const configs = await fetchFieldConfigs(token)

      const visibility: KpiVisibilityMap = {}
      for (const entry of KPI_REGISTRY) visibility[entry.id] = true
      for (const entry of PAGE_REGISTRY) visibility[entry.id] = true

      const fieldsByRole: Partial<Record<AdminRole, Record<string, boolean>>> = {}
      for (const config of configs) {
        if (!ADMIN_ROLES.includes(config.role_name as AdminRole)) continue
        const role = config.role_name as AdminRole
        fieldsByRole[role] = config.fields
        Object.assign(visibility, config.fields)
      }

      set({ visibility, fieldsByRole, loading: false })
    } catch {
      set({ error: 'Failed to load KPI visibility settings', loading: false })
    }
  },

  async setCardVisibility(id, visible, token) {
    const role = ROLE_BY_FIELD_ID[id]
    if (!role) return false

    const previousVisibility = get().visibility
    const previousFieldsByRole = get().fieldsByRole
    const updatedFields = { ...previousFieldsByRole[role], [id]: visible }

    // Optimistic update — flip the flag immediately.
    set({
      savingId: id,
      visibility: { ...previousVisibility, [id]: visible },
      fieldsByRole: { ...previousFieldsByRole, [role]: updatedFields },
    })

    try {
      await updateFieldConfig(role, updatedFields, token)
      set({ savingId: null })
      return true
    } catch {
      // Roll back on failure.
      set({ savingId: null, visibility: previousVisibility, fieldsByRole: previousFieldsByRole })
      return false
    }
  },
}))
