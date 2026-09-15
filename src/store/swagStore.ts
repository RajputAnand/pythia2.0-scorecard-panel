import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { SWAG_STORE, INITIAL_SWAG_ORDERS } from '@/lib/swagstore-data'
import type { SwagProduct, SwagOrder, SwagStoreStats } from '@/types/swagstore'
import { useUserStore } from './userStore'
import {
  fetchSwagRewards,
  createSwagReward,
  updateSwagReward,
  archiveSwagReward,
  unarchiveSwagReward,
  deleteSwagReward,
  redeemSwagReward,
  fetchMyRedemptions,
  fetchRedemptions,
  fulfillRedemption,
  rejectRedemption,
  cancelRedemption,
  fetchSwagStoreStats,
} from '@/queries/swag-store'

export interface ApiOptions {
  token?: string
  storeId?: string
}

interface SwagState {
  catalog: SwagProduct[]
  orders: SwagOrder[]
  stats: SwagStoreStats | null
  loading: boolean
  redeemingId: string | null
  error: string | null
  hasHydrated: boolean
  currentStoreId: string | null

  setHasHydrated: (hydrated: boolean) => void
  setCurrentStoreId: (storeId: string) => void
  fetchCatalog: (options?: ApiOptions & { status?: 'active' | 'archived' | 'all' }) => Promise<void>
  fetchOrders: (options?: ApiOptions & { status?: string }) => Promise<void>
  fetchMyOrders: (options?: ApiOptions) => Promise<void>
  fetchStats: (options?: ApiOptions) => Promise<void>
  addProduct: (
    data: Omit<SwagProduct, 'id' | 'createdAt' | 'status'>,
    options?: ApiOptions
  ) => Promise<SwagProduct>
  updateProduct: (
    id: string,
    updates: Partial<SwagProduct>,
    options?: ApiOptions
  ) => Promise<boolean>
  archiveProduct: (id: string, options?: ApiOptions) => Promise<boolean>
  unarchiveProduct: (id: string, options?: ApiOptions) => Promise<boolean>
  canDeleteProduct: (id: string) => { canDelete: boolean; pendingOrdersCount: number }
  deleteProduct: (id: string, options?: ApiOptions) => Promise<{ success: boolean; reason?: string }>
  completeOrder: (orderId: string, fulfilledBy?: string, options?: ApiOptions) => Promise<boolean>
  cancelOrder: (
    orderId: string,
    cancelledBy?: string,
    options?: ApiOptions
  ) => Promise<{ success: boolean; reason?: string }>
  rejectOrder: (
    orderId: string,
    reason: string,
    rejectedBy?: string,
    options?: ApiOptions
  ) => Promise<{ success: boolean; reason?: string }>
  redeemItem: (
    item: SwagProduct,
    employeeName?: string,
    employeeId?: string,
    options?: ApiOptions
  ) => Promise<{ success: boolean; error?: string }>
  resetToDefaults: () => void
}

export const useSwagStore = create<SwagState>()(
  persist(
    (set, get) => ({
      catalog: SWAG_STORE.catalog,
      orders: INITIAL_SWAG_ORDERS,
      stats: null,
      loading: false,
      redeemingId: null,
      error: null,
      hasHydrated: false,
      currentStoreId: null,

      setHasHydrated(hasHydrated) {
        set({ hasHydrated })
      },

      setCurrentStoreId(currentStoreId) {
        set({ currentStoreId })
      },

      async fetchCatalog(options) {
        set({ loading: true, error: null })
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token
        const status = options?.status || 'all'

        try {
          if (status === 'all') {
            const [active, archived] = await Promise.all([
              fetchSwagRewards({ token, storeId, status: 'active' }),
              fetchSwagRewards({ token, storeId, status: 'archived' }),
            ])
            set({ catalog: [...active, ...archived], loading: false })
          } else {
            const rewards = await fetchSwagRewards({ token, storeId, status })
            set((state) => {
              const otherStatus = state.catalog.filter((r) => r.status !== status)
              return { catalog: [...rewards, ...otherStatus], loading: false }
            })
          }
        } catch {
          set({ loading: false })
        }
      },

      async fetchOrders(options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token
        const status = options?.status

        try {
          const redemptions = await fetchRedemptions({ token, storeId, status })
          set({ orders: redemptions })
        } catch {
          // Keep current orders state
        }
      },

      async fetchMyOrders(options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          const myRedemptions = await fetchMyRedemptions({ token, storeId })
          set({ orders: myRedemptions })
        } catch {
          // Keep current orders state
        }
      },

      async fetchStats(options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          const stats = await fetchSwagStoreStats({ token, storeId })
          set({ stats })
        } catch {
          // Keep current stats state
        }
      },

      async addProduct(data, options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          const created = await createSwagReward({
            token,
            storeId,
            data: {
              name: data.name,
              icon: data.emoji,
              category: data.category || 'Apparel',
              cost_points: data.cost,
              description: data.desc,
              stock_unlimited: data.stock == null,
              stock_remaining: data.stock,
            },
          })
          set((state) => ({
            catalog: [created, ...state.catalog],
          }))
          return created
        } catch {
          const fallbackProduct: SwagProduct = {
            ...data,
            id: `swag_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            status: 'active',
            createdAt: new Date().toISOString(),
          }
          set((state) => ({
            catalog: [fallbackProduct, ...state.catalog],
          }))
          return fallbackProduct
        }
      },

      async updateProduct(id, updates, options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          await updateSwagReward({
            token,
            storeId,
            rewardId: id,
            data: {
              name: updates.name,
              icon: updates.emoji,
              category: updates.category,
              cost_points: updates.cost,
              description: updates.desc,
              stock_unlimited: updates.stock === null ? true : updates.stock !== undefined ? false : undefined,
              stock_remaining: updates.stock,
            },
          })
          set((state) => ({
            catalog: state.catalog.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }))
          return true
        } catch {
          set((state) => ({
            catalog: state.catalog.map((p) => (p.id === id ? { ...p, ...updates } : p)),
          }))
          return true
        }
      },

      async archiveProduct(id, options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          await archiveSwagReward({ token, storeId, rewardId: id })
          set((state) => ({
            catalog: state.catalog.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)),
          }))
          return true
        } catch {
          set((state) => ({
            catalog: state.catalog.map((p) => (p.id === id ? { ...p, status: 'archived' } : p)),
          }))
          return true
        }
      },

      async unarchiveProduct(id, options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          await unarchiveSwagReward({ token, storeId, rewardId: id })
          set((state) => ({
            catalog: state.catalog.map((p) => (p.id === id ? { ...p, status: 'active' } : p)),
          }))
          return true
        } catch {
          set((state) => ({
            catalog: state.catalog.map((p) => (p.id === id ? { ...p, status: 'active' } : p)),
          }))
          return true
        }
      },

      canDeleteProduct(id) {
        const pendingOrders = get().orders.filter(
          (o) => o.productId === id && o.status === 'pending'
        )
        return {
          canDelete: pendingOrders.length === 0,
          pendingOrdersCount: pendingOrders.length,
        }
      },

      async deleteProduct(id, options) {
        const { canDelete, pendingOrdersCount } = get().canDeleteProduct(id)
        if (!canDelete) {
          return {
            success: false,
            reason: `Cannot delete product with ${pendingOrdersCount} pending uncompleted order(s). Archive it instead or complete pending orders.`,
          }
        }

        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        const res = await deleteSwagReward({ token, storeId, rewardId: id })
        if (!res.success) {
          return res
        }

        set((state) => ({
          catalog: state.catalog.filter((p) => p.id !== id),
        }))
        return { success: true }
      },

      async completeOrder(orderId, fulfilledBy = 'Manager', options) {
        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          const updated = await fulfillRedemption({ token, storeId, redemptionId: orderId })
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    status: 'completed',
                    completedAt: updated.completedAt || new Date().toISOString(),
                    fulfilledBy: updated.fulfilledBy || fulfilledBy,
                  }
                : order
            ),
          }))
          return true
        } catch {
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId
                ? {
                    ...order,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    fulfilledBy,
                  }
                : order
            ),
          }))
          return true
        }
      },

      async cancelOrder(orderId, cancelledBy, options) {
        const target = get().orders.find((o) => o.id === orderId)
        if (!target) return { success: false, reason: 'Order not found' }
        if (target.status !== 'pending') {
          return { success: false, reason: `Cannot cancel an order that is already ${target.status}` }
        }

        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          await cancelRedemption({ token, storeId, redemptionId: orderId })
        } catch {
          // Fallback to local state update below
        }

        // 1. Refund points to userStore
        const currentPoints = useUserStore.getState().points ?? 0
        useUserStore.getState().setPoints(currentPoints + target.pointsCost)

        // 2. Restore catalog stock if finite
        const updatedCatalog = get().catalog.map((item) => {
          if (item.id === target.productId && item.stock != null) {
            return { ...item, stock: item.stock + 1 }
          }
          return item
        })

        // 3. Mark order as cancelled
        const updatedOrders = get().orders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'cancelled' as const,
              cancelledAt: new Date().toISOString(),
              cancelledBy: cancelledBy || order.employeeName || 'Employee',
            }
          }
          return order
        })

        set({ catalog: updatedCatalog, orders: updatedOrders })
        return { success: true }
      },

      async rejectOrder(orderId, reason, rejectedBy = 'Manager', options) {
        const target = get().orders.find((o) => o.id === orderId)
        if (!target) return { success: false, reason: 'Order not found' }
        if (target.status !== 'pending') {
          return { success: false, reason: `Cannot reject an order that is already ${target.status}` }
        }

        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        try {
          await rejectRedemption({ token, storeId, redemptionId: orderId })
        } catch {
          // Fallback to local state update below
        }

        // 1. Refund points to userStore
        const currentPoints = useUserStore.getState().points ?? 0
        useUserStore.getState().setPoints(currentPoints + target.pointsCost)

        // 2. Restore catalog stock if finite
        const updatedCatalog = get().catalog.map((item) => {
          if (item.id === target.productId && item.stock != null) {
            return { ...item, stock: item.stock + 1 }
          }
          return item
        })

        // 3. Mark order as rejected with reason
        const updatedOrders = get().orders.map((order) => {
          if (order.id === orderId) {
            return {
              ...order,
              status: 'rejected' as const,
              rejectedAt: new Date().toISOString(),
              rejectedBy: rejectedBy || 'Manager',
              rejectionReason: reason.trim(),
            }
          }
          return order
        })

        set({ catalog: updatedCatalog, orders: updatedOrders })
        return { success: true }
      },

      async redeemItem(item, employeeName = 'Marcus Reynolds', employeeId = 'emp_marcus', options) {
        const previousCatalog = get().catalog
        const previousOrders = get().orders
        const previousPoints = useUserStore.getState().points

        // Decrement stock if finite
        const updatedStock = item.stock != null ? Math.max(0, item.stock - 1) : null

        const storeId = options?.storeId || get().currentStoreId || 'store-1'
        const token = options?.token

        set({ redeemingId: item.id })

        try {
          const apiOrder = await redeemSwagReward({
            token,
            storeId,
            rewardId: item.id,
          })

          const newOrder: SwagOrder = {
            ...apiOrder,
            employeeId: employeeId || apiOrder.employeeId,
            employeeName: employeeName || apiOrder.employeeName,
          }

          set({
            redeemingId: null,
            orders: [newOrder, ...previousOrders],
            catalog: previousCatalog.map((i) =>
              i.id === item.id ? { ...i, stock: updatedStock } : i
            ),
          })
          useUserStore.getState().setPoints((previousPoints ?? 0) - item.cost)
          return { success: true }
        } catch (err: unknown) {
          set({ redeemingId: null })
          const message = err instanceof Error ? err.message : 'Failed to redeem reward'
          return { success: false, error: message }
        }
      },

      resetToDefaults() {
        set({
          catalog: SWAG_STORE.catalog,
          orders: INITIAL_SWAG_ORDERS,
          stats: null,
        })
      },
    }),
    {
      name: 'pythia_swag_store_v2',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      partialize: (state) => ({ catalog: state.catalog, orders: state.orders }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (!Array.isArray(state.catalog) || state.catalog.length === 0) {
            state.catalog = SWAG_STORE.catalog
          }
          if (!Array.isArray(state.orders)) {
            state.orders = INITIAL_SWAG_ORDERS
          }
          state.setHasHydrated(true)
        }
      },
    }
  )
)
