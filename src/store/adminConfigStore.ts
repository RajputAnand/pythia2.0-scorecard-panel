import { create } from 'zustand'
import { fakeGetVisibility, fakeSetVisibility } from '@/mock/adminConfigAPIs'
import type { KpiVisibilityMap } from '@/types/admin-config'

interface AdminConfigState {
  visibility: KpiVisibilityMap
  loading: boolean
  savingId: string | null
  error: string | null

  fetchVisibility: () => Promise<void>
  setCardVisibility: (id: string, visible: boolean) => Promise<boolean>
}

export const useAdminConfigStore = create<AdminConfigState>((set, get) => ({
  visibility: {},
  loading: false,
  savingId: null,
  error: null,

  async fetchVisibility() {
    set({ loading: true, error: null })
    try {
      const { visibility } = await fakeGetVisibility()
      set({ visibility, loading: false })
    } catch {
      set({ error: 'Failed to load KPI visibility settings', loading: false })
    }
  },

  async setCardVisibility(id, visible) {
    const previousVisibility = get().visibility

    // Optimistic update — flip the flag immediately.
    set({
      savingId: id,
      visibility: { ...previousVisibility, [id]: visible },
    })

    try {
      await fakeSetVisibility(id, visible)
      set({ savingId: null })
      return true
    } catch {
      // Roll back on failure.
      set({ savingId: null, visibility: previousVisibility })
      return false
    }
  },
}))
