import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { Store } from '@/types/store'

interface UserStoreState {
  /** Full list of stores the authenticated user has access to */
  stores: Store[]
  /** The store currently selected in the UI (defaults to stores[0] on load) */
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
  subscribeWithSelector((set) => ({
    stores: [],
    currentStore: null,
    currentScore: null,
    points: null,

    setStores(stores) {
      set((state) => {
        const stillValid = state.currentStore && stores.some((s) => s._id === state.currentStore!._id)
        return { stores, currentStore: stillValid ? state.currentStore : (stores[0] ?? null) }
      })
    },

    setCurrentStore(store) {
      set({ currentStore: store })
    },

    setCurrentScore(score) {
      set({ currentScore: score })
    },

    setPoints(points) {
      set({ points })
    },
  }))
)

/**
 * Subscribe to `currentStore` changes outside of React (e.g. in other Zustand
 * stores or plain modules). The callback receives the next and previous value.
 * Call the returned unsubscribe function to clean up.
 *
 * @example
 * // In another store's init / useEffect:
 * const unsub = onStoreChange((next, prev) => {
 *   if (next?.id !== prev?.id) myStore.getState().fetchData()
 * })
 * // cleanup: unsub()
 */
export const onStoreChange = (
  callback: (next: Store | null, prev: Store | null) => void
) =>
  useUserStore.subscribe(
    (state) => state.currentStore,
    callback,
    { equalityFn: (a, b) => a?._id === b?._id, fireImmediately: false }
  )
