import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { Tenant } from '@/types/tenant'
import { INITIAL_TENANTS } from '@/mock/tenantAPIs'
import { fetchTenants } from '@/queries/tenants'

export function isMultiTenantEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === 'true' || process.env.NEXT_PUBLIC_ENABLE_MULTI_TENANT === '1'
}

interface TenantStoreState {
  activeTenant: Tenant | null
  tenants: Tenant[]
  loading: boolean
  error: string | null

  setActiveTenant: (tenant: Tenant | null) => void
  setTenants: (tenants: Tenant[]) => void
  fetchTenantsList: (token?: string) => Promise<void>
}

export const useTenantStore = create<TenantStoreState>()(
  subscribeWithSelector((set) => ({
    activeTenant: INITIAL_TENANTS[0] ?? null,
    tenants: INITIAL_TENANTS,
    loading: false,
    error: null,

    setActiveTenant(tenant) {
      set({ activeTenant: tenant })
    },

    setTenants(tenants) {
      set((state) => {
        const stillValid = state.activeTenant && tenants.some((t) => t.id === state.activeTenant!.id)
        return {
          tenants,
          activeTenant: stillValid ? state.activeTenant : (tenants[0] ?? null),
        }
      })
    },

    async fetchTenantsList(token?: string) {
      set({ loading: true, error: null })
      try {
        const res = await fetchTenants({ token, limit: 100 })
        if (res.success && res.data) {
          set((state) => {
            const list = res.data
            const stillValid = state.activeTenant && list.some((t) => t.id === state.activeTenant!.id)
            return {
              tenants: list,
              activeTenant: stillValid ? state.activeTenant : (list[0] ?? null),
              loading: false,
            }
          })
        }
      } catch {
        set({ loading: false, error: 'Failed to load tenants' })
      }
    },
  }))
)

