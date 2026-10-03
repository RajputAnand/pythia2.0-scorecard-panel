import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Store } from '@/types/store'
import type { Organization } from '@/types/organization'
import type { ApiEmployee } from '@/types/employee'

function syncStoreCookie(storeId: string | null | undefined) {
  if (typeof document !== 'undefined') {
    if (storeId) {
      document.cookie = `pythia_selected_store_id=${encodeURIComponent(storeId)}; path=/; max-age=31536000; SameSite=Lax`
    } else {
      document.cookie = `pythia_selected_store_id=; path=/; max-age=0; SameSite=Lax`
    }
  }
}

function syncOrgCookie(tenantId: string | null | undefined) {
  if (typeof document !== 'undefined') {
    if (tenantId) {
      document.cookie = `pythia_selected_tenant_id=${encodeURIComponent(tenantId)}; path=/; max-age=31536000; SameSite=Lax`
    } else {
      document.cookie = `pythia_selected_tenant_id=; path=/; max-age=0; SameSite=Lax`
    }
  }
}

interface UserStoreState {
  /** Full list of stores the authenticated user has access to */
  stores: Store[]
  /** The store currently selected in the UI */
  currentStore: Store | null
  /** Full list of organizations (available for superadmin) */
  organizations: Organization[]
  /** Currently selected organization (for superadmin) */
  currentOrganization: Organization | null
  /** Employee's current score from the latest weekly stats fetch */
  currentScore: number | null
  /** Employee's available swag points — seeded from session, updated on redemption */
  points: number | null
  /** Currently selected employee (for Super Admin / Manager employee view mirror) */
  selectedEmployee: ApiEmployee | null

  /** Called when the stores query resolves — fully replaces the stores list */
  setStores: (stores: Store[]) => void
  /** User picks a different store from the header dropdown, or null for All Stores */
  setCurrentStore: (store: Store | null) => void
  /** Called when organizations query resolves */
  setOrganizations: (organizations: Organization[]) => void
  /** Superadmin picks an organization from the header dropdown */
  setCurrentOrganization: (org: Organization | null) => void
  /** Called when weeklyStats resolves — stores the employee's current score */
  setCurrentScore: (score: number) => void
  /** Seed from session on Sidebar mount; decremented by swag redemptions */
  setPoints: (points: number) => void
  /** Superadmin / Manager picks an employee from the dropdown */
  setSelectedEmployee: (employee: ApiEmployee | null) => void
}

export const useUserStore = create<UserStoreState>()(
  persist(
    subscribeWithSelector((set) => ({
      stores: [],
      currentStore: null,
      organizations: [],
      currentOrganization: null,
      currentScore: null,
      points: null,
      selectedEmployee: null,

      setStores(stores) {
        set((state) => {
          const stillValid =
            state.currentStore &&
            stores.some((s) => (s.storeNo || s._id) === (state.currentStore?.storeNo || state.currentStore?._id))
          const newCurrentStore = stillValid ? state.currentStore : (stores[0] ?? null)
          syncStoreCookie(newCurrentStore?.storeNo || newCurrentStore?._id)
          return { stores, currentStore: newCurrentStore }
        })
      },

      setCurrentStore(store) {
        syncStoreCookie(store?.storeNo || store?._id)
        set({ currentStore: store })
      },

      setOrganizations(organizations) {
        set((state) => {
          const stillValid =
            state.currentOrganization &&
            organizations.some((o) => o.tenant_id === state.currentOrganization?.tenant_id)
          const newCurrentOrg = stillValid ? state.currentOrganization : (state.currentOrganization || organizations[0] || null)
          syncOrgCookie(newCurrentOrg?.tenant_id)
          return { organizations, currentOrganization: newCurrentOrg }
        })
      },

      setCurrentOrganization(org) {
        syncOrgCookie(org?.tenant_id)
        set({ currentOrganization: org })
      },

      setCurrentScore(score) {
        set({ currentScore: score })
      },

      setPoints(points) {
        set({ points })
      },

      setSelectedEmployee(employee) {
        set({ selectedEmployee: employee })
      },
    })),
    {
      name: 'pythia_user_store',
      partialize: (state) => ({
        currentStore: state.currentStore,
        currentOrganization: state.currentOrganization,
        selectedEmployee: state.selectedEmployee,
      }),
    }
  )
)

/**
 * Subscribe to `currentStore` changes outside of React (e.g. in other Zustand
 * stores or plain modules). The callback receives the next and previous value.
 * Call the returned unsubscribe function to clean up.
 */
export const onStoreChange = (
  callback: (next: Store | null, prev: Store | null) => void
) =>
  useUserStore.subscribe(
    (state) => state.currentStore,
    callback,
    { equalityFn: (a, b) => a?._id === b?._id, fireImmediately: false }
  )

/**
 * Subscribe to `currentOrganization` changes outside of React.
 */
export const onOrganizationChange = (
  callback: (next: Organization | null, prev: Organization | null) => void
) =>
  useUserStore.subscribe(
    (state) => state.currentOrganization,
    callback,
    { equalityFn: (a, b) => a?.tenant_id === b?.tenant_id, fireImmediately: false }
  )

