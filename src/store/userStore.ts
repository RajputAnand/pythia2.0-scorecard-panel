import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { User, Store } from '@/types/user'

interface UserStoreState {
  /** Full user object hydrated from the session on first render */
  user: User | null
  /** The store the owner is currently viewing — null for non-owner roles */
  currentStore: Store | null

  /** Called once (from Header) after the session is resolved server-side */
  setUser: (user: User) => void
  /** Owner selects a different store from the dropdown */
  setCurrentStore: (store: Store) => void
}

export const useUserStore = create<UserStoreState>()(
  subscribeWithSelector((set) => ({
    user: null,
    currentStore: null,

    setUser(user) {
      set((state) => {
        // Derive the default currentStore from the first store in the list
        // (or keep it if already set and still valid for this user)
        const stores = user.stores ?? []
        const existing = state.currentStore
        const stillValid = existing && stores.some((s) => s.id === existing.id)
        const currentStore = stillValid ? existing : (stores[0] ?? null)
        return { user, currentStore }
      })
    },

    setCurrentStore(store) {
      set({ currentStore: store })
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
    { equalityFn: (a, b) => a?.id === b?.id, fireImmediately: false }
  )
