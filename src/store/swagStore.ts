import { create } from 'zustand'
import { SwagItem } from '@/types/swagstore'
import { fakeGet, fakePost } from '@/mock/swagStoreAPIs'

interface SwagStoreState {
  points: number
  items: SwagItem[]
  /** True while the initial points/catalog fetch is in flight */
  loading: boolean
  /** ID of the item currently being redeemed (null when idle) */
  redeemingId: string | null
  /** Last API error message, null when clear */
  error: string | null
  fetchPoints: () => Promise<void>
  /** Returns true on success, false on failure */
  redeem: (item: SwagItem) => Promise<boolean>
}

export const useSwagStore = create<SwagStoreState>((set, get) => ({
  points: 0,
  items: [],
  loading: false,
  redeemingId: null,
  error: null,

  fetchPoints: async () => {
    set({ loading: true, error: null })
    try {
      const { points, catalog } = await fakeGet()
      set({ points, items: catalog, loading: false })
    } catch {
      set({ error: 'Failed to load points. Please refresh.', loading: false })
    }
  },

  redeem: async (item) => {
    const { points } = get()
    if (points < item.cost || item.redeemed) return false
    set({ redeemingId: item.id, error: null })
    try {
      await fakePost(item.id)
      set((state) => ({
        points: state.points - item.cost,
        items: state.items.map((i) => (i.id === item.id ? { ...i, redeemed: true } : i)),
        redeemingId: null,
      }))
      return true
    } catch {
      set({ redeemingId: null, error: `Failed to redeem "${item.name}". Please try again.` })
      return false
    }
  },
}))
