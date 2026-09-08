'use client'

import { useState, useMemo } from 'react'
import { useSwagStore } from '@/store/swagStore'
import { useToast } from '@/context/ToastContext'
import type { SwagProduct, SwagOrder } from '@/types/swagstore'
import styles from './OwnerSwagStore.module.css'
import Select from '@/components/shared/Select/Select'
import CreateSwagProductModal from './CreateSwagProductModal'
import CannotDeleteProductModal from './CannotDeleteProductModal'
import ConfirmDeleteProductModal from './ConfirmDeleteProductModal'
import ConfirmArchiveProductModal from './ConfirmArchiveProductModal'
import RejectOrderModal from '@/components/ManagerOrdersPanel/RejectOrderModal'

interface OwnerSwagStoreProps {
  readOnly?: boolean
  actorTitle?: string
}

export default function OwnerSwagStore({
  readOnly = false,
  actorTitle = 'Store Owner',
}: OwnerSwagStoreProps) {
  const {
    catalog,
    orders,
    addProduct,
    updateProduct,
    archiveProduct,
    unarchiveProduct,
    deleteProduct,
    canDeleteProduct,
    completeOrder,
    rejectOrder,
    resetToDefaults,
  } = useSwagStore()

  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'active' | 'archived' | 'orders'>('active')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SwagProduct | null>(null)
  const [archivingProduct, setArchivingProduct] = useState<SwagProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<SwagProduct | null>(null)
  const [rejectingOrder, setRejectingOrder] = useState<SwagOrder | null>(null)
  const [blockedDeleteProduct, setBlockedDeleteProduct] = useState<{
    product: SwagProduct
    pendingCount: number
  } | null>(null)

  // Derived metrics
  const activeProducts = useMemo(
    () => (catalog ?? []).filter((p) => p?.status !== 'archived'),
    [catalog]
  )
  const archivedProducts = useMemo(
    () => (catalog ?? []).filter((p) => p?.status === 'archived'),
    [catalog]
  )
  const pendingOrders = useMemo(
    () => (orders ?? []).filter((o) => o?.status === 'pending'),
    [orders]
  )
  const completedOrders = useMemo(
    () => (orders ?? []).filter((o) => o?.status === 'completed'),
    [orders]
  )
  const totalPointsRedeemed = useMemo(
    () => (orders ?? []).reduce((sum, o) => sum + (o?.pointsCost || 0), 0),
    [orders]
  )

  // Categories present in catalog
  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    ;(catalog ?? []).forEach((p) => {
      if (p?.category) set.add(p.category)
    })
    return Array.from(set)
  }, [catalog])

  const categoryFilterOptions = useMemo(() => [
    { label: 'All Categories', value: 'ALL' },
    ...availableCategories.map((cat) => ({ label: cat, value: cat })),
  ], [availableCategories])

  // Filtered products
  const currentTabProducts = activeTab === 'active' ? activeProducts : archivedProducts
  const filteredProducts = useMemo(() => {
    return (currentTabProducts ?? []).filter((p) => {
      if (!p) return false
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        p.name?.toLowerCase().includes(q) ||
        p.desc?.toLowerCase().includes(q)
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [currentTabProducts, searchQuery, selectedCategory])

  // Handlers
  const handleSaveProduct = (data: Omit<SwagProduct, 'id' | 'createdAt' | 'status'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data)
      showToast(`Updated "${data.name}" successfully.`)
      setEditingProduct(null)
    } else {
      const created = addProduct(data)
      showToast(`Added "${created.name}" to the swag store!`)
      setIsCreateModalOpen(false)
    }
  }

  const handleAttemptDelete = (product: SwagProduct) => {
    const { canDelete, pendingOrdersCount } = canDeleteProduct(product.id)
    if (!canDelete) {
      setBlockedDeleteProduct({ product, pendingCount: pendingOrdersCount })
    } else {
      setDeletingProduct(product)
    }
  }

  const handleConfirmDelete = () => {
    if (!deletingProduct) return
    const res = deleteProduct(deletingProduct.id)
    if (res.success) {
      showToast(`Deleted "${deletingProduct.name}" from catalog.`)
    } else {
      showToast(res.reason || 'Failed to delete reward.')
    }
    setDeletingProduct(null)
  }

  const handleConfirmArchive = () => {
    if (!archivingProduct) return
    archiveProduct(archivingProduct.id)
    showToast(`Archived "${archivingProduct.name}". Hidden from employee store.`)
    setArchivingProduct(null)
  }

  const handleUnarchive = (product: SwagProduct) => {
    unarchiveProduct(product.id)
    showToast(`Restored "${product.name}" to the active catalog!`)
  }

  const handleCompleteOrder = (orderId: string, productName: string, employeeName: string) => {
    completeOrder(orderId, actorTitle.includes('Manager') ? 'Manager' : 'Owner')
    showToast(`Fulfilled order for ${employeeName} (${productName})!`)
  }

  const handleConfirmReject = (reason: string) => {
    if (!rejectingOrder) return
    const res = rejectOrder(rejectingOrder.id, reason, actorTitle)
    if (res.success) {
      showToast(
        `Order #${rejectingOrder.id} rejected. ${rejectingOrder.pointsCost.toLocaleString('en-US')} pts refunded to ${rejectingOrder.employeeName}.`
      )
    } else {
      showToast(res.reason || 'Failed to reject order.')
    }
    setRejectingOrder(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Summary Metrics Strip ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Rewards */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Active Rewards
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-primary font-mono">
              {activeProducts.length}
            </span>
            <span className="text-[12px] text-muted">
              {archivedProducts.length} archived
            </span>
          </div>
        </div>

        {/* Metric 2: Pending Redemptions */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Pending Fulfillment
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-[26px] font-bold font-mono ${
                pendingOrders.length > 0 ? 'text-amber' : 'text-primary'
              }`}
            >
              {pendingOrders.length}
            </span>
            <span className="text-[11.5px] text-muted">
              {pendingOrders.length > 0 ? 'Awaiting action' : 'All clear'}
            </span>
          </div>
        </div>

        {/* Metric 3: Total Points Claimed */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Total Points Claimed
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold font-mono text-gold flex items-center gap-1.5">
              <span>🪙</span>
              {totalPointsRedeemed.toLocaleString('en-US')}
            </span>
            <span className="text-[11.5px] text-muted font-medium">pts total</span>
          </div>
        </div>

        {/* Metric 4: Fulfilled Orders */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Fulfilled Orders
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold font-mono text-accent">
              {completedOrders.length}
            </span>
            <span className="text-[11.5px] text-muted">
              {orders.length} total orders
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Panel ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border px-5 bg-surface-alt/30">
          <div className="flex gap-2 -mb-[1px]">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`${styles.tabBtn} ${
                activeTab === 'active' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>Active Catalog</span>
              <span className="rounded-full bg-border/80 px-2 py-0.5 text-[11px] font-mono">
                {activeProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('archived')}
              className={`${styles.tabBtn} ${
                activeTab === 'archived' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>Archived</span>
              <span className="rounded-full bg-border/80 px-2 py-0.5 text-[11px] font-mono">
                {archivedProducts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`${styles.tabBtn} ${
                activeTab === 'orders' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>Redemptions & Fulfillment</span>
              {pendingOrders.length > 0 && (
                <span className="rounded-full bg-amber-light text-amber border border-amber/30 px-2 py-0.5 text-[11px] font-semibold font-mono">
                  {pendingOrders.length} pending
                </span>
              )}
            </button>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2 py-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-accent hover:opacity-90 text-white font-semibold text-[12.5px] rounded-lg px-3.5 py-1.5 transition-opacity cursor-pointer shadow-sm"
              >
                <span>+</span> Add Reward
              </button>
            </div>
          )}
        </div>

        {/* ── Tab 1 & 2: Active / Archived Rewards ───────────────────── */}
        {(activeTab === 'active' || activeTab === 'archived') && (
          <div className="p-5">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted text-[13px]">
                    🔍
                  </span>
                  <input
                    type="text"
                    placeholder="Search rewards…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-alt border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
                  />
                </div>

                <Select
                  value={selectedCategory}
                  options={categoryFilterOptions}
                  onChange={(val) => setSelectedCategory(String(val))}
                  ariaLabel="Filter rewards by category"
                  triggerClassName="bg-surface-alt py-[5px] text-[12px]"
                />
              </div>

              <div className="flex items-center gap-2 text-[11.5px] text-muted self-end sm:self-auto">
                <span>Showing {filteredProducts.length} items</span>
                <button
                  type="button"
                  onClick={resetToDefaults}
                  className="text-muted hover:text-secondary underline ml-2 cursor-pointer"
                  title="Reset catalog and orders to default demo data"
                >
                  Reset Catalog Demo Data
                </button>
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-[36px] mb-2">
                  {activeTab === 'archived' ? '🗄️' : '🛍️'}
                </span>
                <p className="font-semibold text-[14px] text-primary">
                  {activeTab === 'archived'
                    ? 'No archived rewards found'
                    : 'No active rewards found'}
                </p>
                <p className="text-[12px] text-muted mt-1 max-w-sm">
                  {searchQuery || selectedCategory !== 'ALL'
                    ? 'Try adjusting your search query or category filter.'
                    : activeTab === 'archived'
                    ? 'Rewards you archive to stop employee claims will appear here.'
                    : 'Click "+ Add Reward" to create your first employee reward.'}
                </p>
                {!readOnly && activeTab === 'active' && (
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 bg-accent hover:opacity-90 text-white font-semibold text-[12.5px] rounded-lg px-4 py-2 transition-opacity cursor-pointer"
                  >
                    + Add First Reward
                  </button>
                )}
              </div>
            )}

            {/* Product Cards Grid */}
            {filteredProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((product) => {
                  const productOrders = orders.filter((o) => o.productId === product.id)
                  const pendingCount = productOrders.filter((o) => o.status !== 'completed').length
                  const hasPendingOrders = pendingCount > 0

                  return (
                    <div key={product.id} className={styles.productCard}>
                      <div>
                        {/* Header: Emoji + Category + Cost */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl border border-border bg-surface-alt flex items-center justify-center text-[24px]">
                              {product.emoji}
                            </div>
                            <div>
                              <h3 className="font-semibold text-[14px] text-primary leading-snug">
                                {product.name}
                              </h3>
                              {product.category && (
                                <span className="inline-block mt-0.5 rounded-full bg-surface-alt px-2 py-0.5 text-[10.5px] font-medium text-secondary">
                                  {product.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Points Badge (strictly points, no dollar sign) */}
                          <div className="flex flex-col items-end">
                            <span className="font-mono font-bold text-[14px] text-gold flex items-center gap-1 bg-surface-alt/70 px-2.5 py-1 rounded-lg border border-border">
                              <span>🪙</span>
                              {product.cost.toLocaleString('en-US')}
                              <span className="text-[10px] text-muted">pts</span>
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mt-3 text-[12px] leading-relaxed text-secondary line-clamp-2">
                          {product.desc}
                        </p>
                      </div>

                      {/* Footer: Stock + Orders Status + Actions */}
                      <div className="mt-4 pt-3.5 border-t border-border flex flex-col gap-3">
                        <div className="flex items-center justify-between text-[11.5px]">
                          {/* Stock Status */}
                          <span className="text-muted">
                            {product.stock == null ? (
                              <span className="text-secondary font-medium">♾️ Unlimited Stock</span>
                            ) : product.stock === 0 ? (
                              <span className="text-danger font-semibold">⚠️ Out of Stock (0 left)</span>
                            ) : (
                              <span className="text-secondary font-medium">
                                📦 {product.stock} units left
                              </span>
                            )}
                          </span>

                          {/* Orders Counter */}
                          <div>
                            {hasPendingOrders ? (
                              <span className="inline-flex items-center gap-1 text-amber font-semibold text-[11px] bg-amber-light px-2 py-0.5 rounded-md">
                                <span>🔒</span> {pendingCount} pending order{pendingCount > 1 ? 's' : ''}
                              </span>
                            ) : productOrders.length > 0 ? (
                              <span className="text-muted text-[11px]">
                                ✓ {productOrders.length} fulfilled
                              </span>
                            ) : (
                              <span className="text-muted text-[11px]">0 orders</span>
                            )}
                          </div>
                        </div>

                        {/* Actions Row */}
                        {!readOnly && (
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-2">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => setEditingProduct(product)}
                                className="border border-border bg-surface-alt hover:bg-surface text-primary text-[11.5px] font-medium rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                              >
                                Edit
                              </button>

                              {/* Archive / Unarchive Button */}
                              {product.status === 'archived' ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnarchive(product)}
                                  className="border border-border text-accent hover:bg-accent-light text-[11.5px] font-medium rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                                >
                                  Unarchive
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setArchivingProduct(product)}
                                  className="border border-border text-secondary hover:text-primary text-[11.5px] font-medium rounded-md px-2.5 py-1 transition-colors cursor-pointer"
                                >
                                  Archive
                                </button>
                              )}
                            </div>

                            {/* Delete Button (gated by pending orders condition) */}
                            <button
                              type="button"
                              onClick={() => handleAttemptDelete(product)}
                              className={`text-[11.5px] font-medium rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                                hasPendingOrders
                                  ? 'border border-amber/40 text-amber hover:bg-amber-light/50'
                                  : 'border border-border text-danger hover:bg-danger-light'
                              }`}
                              title={
                                hasPendingOrders
                                  ? 'Product has pending orders. Click to archive instead.'
                                  : 'Permanently delete product'
                              }
                            >
                              {hasPendingOrders ? 'Delete (Locked)' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab 3: Redemptions & Orders List ───────────────────────── */}
        {activeTab === 'orders' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[14px] text-primary">
                  Employee Redemptions & Fulfillment
                </h3>
                <p className="text-[12px] text-muted mt-0.5">
                  Fulfill rewards claimed by employees. Completing open orders unlocks deletion
                  for products that no longer have pending obligations.
                </p>
              </div>

              <div className="text-[11.5px] text-muted">
                {orders.length} total orders recorded
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="text-[36px] mb-2">📦</span>
                <p className="font-semibold text-[13.5px] text-primary">No redemptions yet</p>
                <p className="text-[12px] text-muted mt-1">
                  When employees claim rewards from the swag store, their orders will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full border-collapse text-left text-[12.5px]">
                  <thead>
                    <tr className="bg-surface-alt/70 text-secondary text-[11px] font-semibold uppercase tracking-[.06em] border-b border-border">
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Claimed Reward</th>
                      <th className="px-4 py-3">Employee</th>
                      <th className="px-4 py-3">Points Deducted</th>
                      <th className="px-4 py-3">Date Claimed</th>
                      <th className="px-4 py-3">Status</th>
                      {!readOnly && <th className="px-4 py-3 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((order) => {
                      const isPending = order.status === 'pending'
                      const isCompleted = order.status === 'completed'
                      const isRejected = order.status === 'rejected'
                      const isCancelled = order.status === 'cancelled'

                      const orderDate = new Date(order.orderedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-surface-alt/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-[11.5px] text-secondary">
                            {order.id}
                          </td>

                          <td className="px-4 py-3 font-medium text-primary">
                            <div className="flex items-center gap-2">
                              <span className="text-[18px]">{order.productEmoji}</span>
                              <span>{order.productName}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 text-secondary font-medium">
                            {order.employeeName}
                          </td>

                          <td className="px-4 py-3 font-mono font-bold text-gold">
                            🪙 {order.pointsCost.toLocaleString('en-US')} pts
                            {(isCancelled || isRejected) && (
                              <span className="block font-sans text-[10px] font-semibold text-accent">
                                (Refunded)
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-muted text-[12px]">
                            {orderDate}
                          </td>

                          <td className="px-4 py-3">
                            {isPending ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-light text-amber border border-amber/25 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0 animate-pulse" />
                                Pending Fulfillment
                              </span>
                            ) : isCompleted ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-accent-light text-accent whitespace-nowrap">
                                ✓ Completed
                              </span>
                            ) : isRejected ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger/10 text-danger border border-danger/20 whitespace-nowrap">
                                  ✕ Rejected
                                </span>
                                {order.rejectionReason && (
                                  <span className="block text-[10.5px] text-muted mt-0.5 truncate max-w-[160px]" title={order.rejectionReason}>
                                    &ldquo;{order.rejectionReason}&rdquo;
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-alt text-secondary border border-border whitespace-nowrap">
                                ⊘ Cancelled
                              </span>
                            )}
                          </td>

                          {!readOnly && (
                            <td className="px-4 py-3 text-right">
                              {isPending ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCompleteOrder(
                                        order.id,
                                        order.productName,
                                        order.employeeName
                                      )
                                    }
                                    className="bg-accent hover:opacity-90 text-white font-semibold text-[11.5px] rounded-lg px-2.5 py-1 transition-opacity cursor-pointer shadow-xs whitespace-nowrap"
                                  >
                                    Fulfill
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectingOrder(order)}
                                    className="border border-danger/30 text-danger hover:bg-danger/10 font-semibold text-[11.5px] rounded-lg px-2 py-1 transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : isCompleted ? (
                                <span className="text-muted text-[11.5px] italic">
                                  Fulfilled
                                </span>
                              ) : isRejected ? (
                                <span className="text-danger font-medium text-[11.5px]">
                                  Rejected
                                </span>
                              ) : (
                                <span className="text-muted text-[11.5px] italic">
                                  Cancelled
                                </span>
                              )}
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <CreateSwagProductModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleSaveProduct}
        />
      )}

      {editingProduct && (
        <CreateSwagProductModal
          initialProduct={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSubmit={handleSaveProduct}
        />
      )}

      {blockedDeleteProduct && (
        <CannotDeleteProductModal
          product={blockedDeleteProduct.product}
          pendingOrdersCount={blockedDeleteProduct.pendingCount}
          onClose={() => setBlockedDeleteProduct(null)}
          onArchiveInstead={() => {
            archiveProduct(blockedDeleteProduct.product.id)
            showToast(`Archived "${blockedDeleteProduct.product.name}".`)
            setBlockedDeleteProduct(null)
          }}
          onViewOrders={() => {
            setBlockedDeleteProduct(null)
            setActiveTab('orders')
          }}
        />
      )}

      {deletingProduct && (
        <ConfirmDeleteProductModal
          product={deletingProduct}
          onCancel={() => setDeletingProduct(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {archivingProduct && (
        <ConfirmArchiveProductModal
          product={archivingProduct}
          onCancel={() => setArchivingProduct(null)}
          onConfirm={handleConfirmArchive}
        />
      )}

      {rejectingOrder && (
        <RejectOrderModal
          order={rejectingOrder}
          roleTitle={actorTitle}
          onCancel={() => setRejectingOrder(null)}
          onConfirm={handleConfirmReject}
        />
      )}
    </div>
  )
}
