import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { Store } from '@/types/store'

function syncStoreCookie(storeId: string | null | undefined) {
  if (typeof document !== 'undefined') {
    if (storeId) {
      document.cookie = `pythia_selected_store_id=${encodeURIComponent(storeId)}; path=/; max-age=31536000; SameSite=Lax`
    } else {
      document.cookie = `pythia_selected_store_id=; path=/; max-age=0; SameSite=Lax`
    }
  }
}

interface UserStoreState {
  /** Full list of stores the authenticated user has access to */
  stores: Store[]
  /** The store currently selected in the UI */
  currentStore: Store | null
  /** Employee's current score from the latest weekly stats fetch */
  currentScore: number | null
  /** Employee's available swag points — seeded from session, updated on redemption */
  points: number | null

  /** Called when the stores query resolves — fully replaces the stores list */
  setStores: (stores: Store[]) => void
  /** User picks a different store from the header dropdown */
  setCurrentStore: (store: Store) => void
  /** Called when weeklyStats resolves — stores the employee's current score */
  setCurrentScore: (score: number) => void
  /** Seed from session on Sidebar mount; decremented by swag redemptions */
  setPoints: (points: number) => void
}

export const useUserStore = create<UserStoreState>()(
  persist(
    subscribeWithSelector((set) => ({
      stores: [],
      currentStore: null,
      currentScore: null,
      points: null,

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

      setCurrentScore(score) {
        set({ currentScore: score })
      },

      setPoints(points) {
        set({ points })
      },
    })),
    {
      name: 'pythia_user_store',
      partialize: (state) => ({ currentStore: state.currentStore }),
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
