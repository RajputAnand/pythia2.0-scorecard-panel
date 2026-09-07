import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { fakeGet, fakePost } from '@/mock/swagStoreAPIs'
import { SWAG_STORE, INITIAL_SWAG_ORDERS } from '@/lib/swagstore-data'
import type { SwagProduct, SwagOrder } from '@/types/swagstore'
import { useUserStore } from './userStore'

interface SwagState {
  catalog: SwagProduct[]
  orders: SwagOrder[]
  loading: boolean
  redeemingId: string | null
  error: string | null
  hasHydrated: boolean

  setHasHydrated: (hydrated: boolean) => void
  fetchCatalog: () => Promise<void>
  addProduct: (data: Omit<SwagProduct, 'id' | 'createdAt' | 'status'>) => SwagProduct
  updateProduct: (id: string, updates: Partial<SwagProduct>) => void
  archiveProduct: (id: string) => void
  unarchiveProduct: (id: string) => void
  canDeleteProduct: (id: string) => { canDelete: boolean; pendingOrdersCount: number }
  deleteProduct: (id: string) => { success: boolean; reason?: string }
  completeOrder: (orderId: string) => void
  redeemItem: (item: SwagProduct, employeeName?: string, employeeId?: string) => Promise<boolean>
  resetToDefaults: () => void
}

export const useSwagStore = create<SwagState>()(
  persist(
    (set, get) => ({
      catalog: SWAG_STORE.catalog,
      orders: INITIAL_SWAG_ORDERS,
      loading: false,
      redeemingId: null,
      error: null,
      hasHydrated: false,

      setHasHydrated(hasHydrated) {
        set({ hasHydrated })
      },

      async fetchCatalog() {
        set({ loading: true, error: null })
        try {
          const { catalog } = await fakeGet()
          // Only seed if catalog is empty
          if (get().catalog.length === 0) {
            set({ catalog, loading: false })
          } else {
            set({ loading: false })
          }
        } catch {
          set({ error: 'Failed to load rewards', loading: false })
        }
      },

      addProduct(data) {
        const newProduct: SwagProduct = {
          ...data,
          id: `swag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({
          catalog: [newProduct, ...state.catalog],
        }))
        return newProduct
      },

      updateProduct(id, updates) {
        set((state) => ({
          catalog: state.catalog.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }))
      },

      archiveProduct(id) {
        set((state) => ({
          catalog: state.catalog.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)),
        }))
      },

      unarchiveProduct(id) {
        set((state) => ({
          catalog: state.catalog.map((p) => (p.id === id ? { ...p, status: 'active' } : p)),
        }))
      },

      canDeleteProduct(id) {
        const pendingOrders = get().orders.filter(
          (o) => o.productId === id && o.status !== 'completed'
        )
        return {
          canDelete: pendingOrders.length === 0,
          pendingOrdersCount: pendingOrders.length,
        }
      },

      deleteProduct(id) {
        const { canDelete, pendingOrdersCount } = get().canDeleteProduct(id)
        if (!canDelete) {
          return {
            success: false,
            reason: `Cannot delete product with ${pendingOrdersCount} pending uncompleted order(s). Archive it instead or complete pending orders.`,
          }
        }
        set((state) => ({
          catalog: state.catalog.filter((p) => p.id !== id),
        }))
        return { success: true }
      },

      completeOrder(orderId) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, status: 'completed', completedAt: new Date().toISOString() }
              : order
          ),
        }))
      },

      async redeemItem(item, employeeName = 'Marcus Reynolds', employeeId = 'emp_marcus') {
        const previousCatalog = get().catalog
        const previousOrders = get().orders
        const previousPoints = useUserStore.getState().points

        // Decrement stock if finite
        const updatedStock = item.stock != null ? Math.max(0, item.stock - 1) : null

        const newOrder: SwagOrder = {
          id: `ord_${Date.now()}`,
          productId: item.id,
          productName: item.name,
          productEmoji: item.emoji,
          employeeId,
          employeeName,
          pointsCost: item.cost,
          status: 'pending',
          orderedAt: new Date().toISOString(),
        }

        // Optimistic update — mark redeemed, record order, and deduct points immediately.
        set({
          redeemingId: item.id,
          orders: [newOrder, ...previousOrders],
          catalog: previousCatalog.map((i) =>
            i.id === item.id ? { ...i, redeemed: true, stock: updatedStock } : i
          ),
        })
        useUserStore.getState().setPoints((previousPoints ?? 0) - item.cost)

        try {
          await fakePost(item.id)
          set({ redeemingId: null })
          return true
        } catch {
          // Roll back on failure.
          set({
            redeemingId: null,
            catalog: previousCatalog,
            orders: previousOrders,
          })
          useUserStore.getState().setPoints(previousPoints ?? 0)
          return false
        }
      },

      resetToDefaults() {
        set({
          catalog: SWAG_STORE.catalog,
          orders: INITIAL_SWAG_ORDERS,
        })
      },
    }),
    {
      name: 'pythia_swag_store_v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ catalog: state.catalog, orders: state.orders }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

