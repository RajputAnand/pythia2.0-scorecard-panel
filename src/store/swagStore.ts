import { create } from 'zustand'
import { fakeGet, fakePost } from '@/mock/swagStoreAPIs'
import type { SwagItem } from '@/types/swagstore'
import { useUserStore } from './userStore'

interface SwagState {
  catalog: SwagItem[]
  loading: boolean
  redeemingId: string | null
  error: string | null

  fetchCatalog: () => Promise<void>
  redeemItem: (item: SwagItem) => Promise<boolean>
}

export const useSwagStore = create<SwagState>((set, get) => ({
  catalog: [],
  loading: false,
  redeemingId: null,
  error: null,

  async fetchCatalog() {
    set({ loading: true, error: null })
    try {
      const { catalog } = await fakeGet()
      set({ catalog, loading: false })
    } catch {
      set({ error: 'Failed to load rewards', loading: false })
    }
  },

  async redeemItem(item) {
    const previousCatalog = get().catalog
    const previousPoints = useUserStore.getState().points

    // Optimistic update — mark redeemed and deduct points immediately.
    set({
      redeemingId: item.id,
      catalog: previousCatalog.map((i) => (i.id === item.id ? { ...i, redeemed: true } : i)),
    })
    useUserStore.getState().setPoints((previousPoints ?? 0) - item.cost)

    try {
      await fakePost(item.id)
      set({ redeemingId: null })
      return true
    } catch {
      // Roll back on failure.
      set({ redeemingId: null, catalog: previousCatalog })
      useUserStore.getState().setPoints(previousPoints ?? 0)
      return false
    }
  },
}))
