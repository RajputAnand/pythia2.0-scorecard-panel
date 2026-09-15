'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUserStore } from '@/store/userStore'
import { useSwagStore } from '@/store/swagStore'
import { useToast } from '@/context/ToastContext'
import type { SwagOrder } from '@/types/swagstore'
import Select from '@/components/shared/Select/Select'
import ConfirmFulfillOrderModal from './ConfirmFulfillOrderModal'
import RejectOrderModal from './RejectOrderModal'
import styles from './ManagerOrdersPanel.module.css'

interface ManagerOrdersPanelProps {
  readOnly?: boolean
}

export default function ManagerOrdersPanel({ readOnly = false }: ManagerOrdersPanelProps) {
  const { data: session } = useSession()
  const managerName = session?.user?.name || 'Jamie L. (Manager)'
  const token = session?.user?.pythia2Token || session?.user?.token
  const currentStore = useUserStore((s) => s.currentStore)
  const storeId =
    currentStore?.storeNo ||
    currentStore?._id ||
    session?.user?.store_ids?.[0] ||
    ((session?.user as Record<string, unknown> | undefined)?.storeIds as string[] | undefined)?.[0] ||
    '69c19e66a27efce5858b6487'

  const { orders, stats, fetchOrders, fetchStats, completeOrder, rejectOrder } = useSwagStore()
  const { showToast } = useToast()

  useEffect(() => {
    fetchOrders({ token, storeId })
    fetchStats({ token, storeId })
  }, [fetchOrders, fetchStats, token, storeId])

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'rejected' | 'all'>('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [fulfillingOrder, setFulfillingOrder] = useState<SwagOrder | null>(null)
  const [rejectingOrder, setRejectingOrder] = useState<SwagOrder | null>(null)

  // Derived metrics
  const pendingOrders = useMemo(
    () => (orders ?? []).filter((o) => o?.status === 'pending'),
    [orders]
  )
  const completedOrders = useMemo(
    () => (orders ?? []).filter((o) => o?.status === 'completed'),
    [orders]
  )
  const rejectedOrCancelledOrders = useMemo(
    () => (orders ?? []).filter((o) => o?.status === 'rejected' || o?.status === 'cancelled'),
    [orders]
  )
  const totalPointsRedeemed = useMemo(
    () => (orders ?? []).reduce((sum, o) => sum + (o?.pointsCost || 0), 0),
    [orders]
  )
  const uniqueEmployeesCount = useMemo(() => {
    const set = new Set<string>()
    ;(orders ?? []).forEach((o) => {
      if (o?.employeeName) set.add(o.employeeName)
    })
    return set.size
  }, [orders])

  // Extract available categories
  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    ;(orders ?? []).forEach((o) => {
      if (o?.category) set.add(o.category)
    })
    return [
      { label: 'All Categories', value: 'ALL' },
      ...Array.from(set).map((cat) => ({ label: cat, value: cat })),
    ]
  }, [orders])

  // Filtered orders list based on tab, search, and category
  const currentTabOrders = useMemo(() => {
    if (activeTab === 'pending') return pendingOrders
    if (activeTab === 'completed') return completedOrders
    if (activeTab === 'rejected') return rejectedOrCancelledOrders
    return orders ?? []
  }, [activeTab, pendingOrders, completedOrders, rejectedOrCancelledOrders, orders])

  const filteredOrders = useMemo(() => {
    return (currentTabOrders ?? []).filter((o) => {
      if (!o) return false
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        o.id?.toLowerCase().includes(q) ||
        o.employeeName?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q)

      const matchesCategory =
        selectedCategory === 'ALL' || o.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [currentTabOrders, searchQuery, selectedCategory])

  const handleConfirmFulfill = async () => {
    if (!fulfillingOrder) return
    await completeOrder(fulfillingOrder.id, managerName, { token, storeId })
    showToast(
      `✓ Order #${fulfillingOrder.id} for ${fulfillingOrder.employeeName} (${fulfillingOrder.productName}) marked as fulfilled!`
    )
    setFulfillingOrder(null)
  }

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingOrder) return
    const res = await rejectOrder(rejectingOrder.id, reason, managerName, { token, storeId })
    if (res.success) {
      showToast(
        `Order #${rejectingOrder.id} rejected. ${rejectingOrder.pointsCost.toLocaleString('en-US')} pts refunded to ${rejectingOrder.employeeName}.`
      )
    } else {
      showToast(res.reason || 'Failed to reject order.')
    }
    setRejectingOrder(null)
  }

  const pendingCount = stats?.pending_fulfillment ?? pendingOrders.length
  const completedCount = stats?.fulfilled_orders ?? completedOrders.length
  const totalOrdersCount = stats?.total_orders ?? orders.length
  const pointsDeducted = stats?.total_points_claimed ?? totalPointsRedeemed
  const employeesRewarded = stats?.employees_rewarded ?? uniqueEmployeesCount

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top KPI Metrics Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pending Fulfillment */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Pending Fulfillment
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span
              className={`text-[26px] font-bold font-mono ${
                pendingCount > 0 ? 'text-amber' : 'text-primary'
              }`}
            >
              {pendingCount}
            </span>
            <span className="text-[11.5px] text-muted">
              {pendingCount > 0 ? 'Needs action' : 'All fulfilled'}
            </span>
          </div>
        </div>

        {/* Metric 2: Completed Orders */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Fulfilled Orders
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold font-mono text-accent">
              {completedCount}
            </span>
            <span className="text-[11.5px] text-muted">
              {totalOrdersCount} total orders
            </span>
          </div>
        </div>

        {/* Metric 3: Total Points Deducted */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Points Deducted
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold font-mono text-gold flex items-center gap-1.5">
              <span>🪙</span>
              {pointsDeducted.toLocaleString('en-US')}
            </span>
            <span className="text-[11.5px] text-muted font-medium">pts total</span>
          </div>
        </div>

        {/* Metric 4: Rewarded Employees */}
        <div className={styles.metricCard}>
          <span className="text-[11.5px] font-semibold text-secondary uppercase tracking-[.06em]">
            Employees Rewarded
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold font-mono text-primary">
              {employeesRewarded}
            </span>
            <span className="text-[11.5px] text-muted">team members</span>
          </div>
        </div>
      </div>

      {/* ── Main Orders Panel ───────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border px-5 bg-surface-alt/30">
          <div className="flex gap-2 -mb-[1px]">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`${styles.tabBtn} ${
                activeTab === 'pending' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>Awaiting Fulfillment</span>
              {pendingOrders.length > 0 ? (
                <span className="rounded-full bg-amber-light text-amber border border-amber/30 px-2 py-0.5 text-[11px] font-semibold font-mono">
                  {pendingOrders.length}
                </span>
              ) : (
                <span className="rounded-full bg-border/80 px-2 py-0.5 text-[11px] font-mono">
                  0
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`${styles.tabBtn} ${
                activeTab === 'completed' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>Fulfilled History</span>
              <span className="rounded-full bg-border/80 px-2 py-0.5 text-[11px] font-mono">
                {completedOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rejected')}
              className={`${styles.tabBtn} ${
                activeTab === 'rejected' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>Cancelled & Rejected</span>
              <span className="rounded-full bg-border/80 px-2 py-0.5 text-[11px] font-mono">
                {rejectedOrCancelledOrders.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`${styles.tabBtn} ${
                activeTab === 'all' ? styles.tabBtnActive : styles.tabBtnInactive
              }`}
            >
              <span>All Orders</span>
              <span className="rounded-full bg-border/80 px-2 py-0.5 text-[11px] font-mono">
                {orders.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center text-[12px] text-muted py-2">
            Points deducted automatically upon employee claim
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="p-5 border-b border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted text-[13px]">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by employee, reward, or order ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-lg pl-8 pr-3 py-1.5 text-[12.5px] text-primary placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {categoryOptions.length > 2 && (
              <Select
                value={selectedCategory}
                options={categoryOptions}
                onChange={(val) => setSelectedCategory(String(val))}
                ariaLabel="Filter orders by category"
                triggerClassName="bg-surface-alt py-[5px] text-[12px]"
              />
            )}
          </div>

          <div className="text-[11.5px] text-muted self-end sm:self-auto">
            Showing {filteredOrders.length} of {currentTabOrders.length} orders
          </div>
        </div>

        {/* Orders Table */}
        <div className="p-5">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-[36px] mb-2">
                {activeTab === 'pending' ? '🎉' : '📦'}
              </span>
              <p className="font-semibold text-[14px] text-primary">
                {activeTab === 'pending'
                  ? 'No pending orders awaiting fulfillment'
                  : activeTab === 'rejected'
                  ? 'No cancelled or rejected orders'
                  : 'No orders found matching criteria'}
              </p>
              <p className="text-[12px] text-muted mt-1 max-w-sm">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Try clearing your search query or category filter.'
                  : activeTab === 'pending'
                  ? 'Great job! All rewards claimed by team members have been fulfilled.'
                  : 'Reward redemptions submitted by employees will show up here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full border-collapse text-left text-[12.5px]">
                <thead>
                  <tr className="bg-surface-alt/70 text-secondary text-[11px] font-semibold uppercase tracking-[.06em] border-b border-border">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date Claimed</th>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Claimed Reward</th>
                    <th className="px-4 py-3">Points Deducted</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Fulfillment Info</th>
                    {!readOnly && <th className="px-4 py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => {
                    const isPending = order.status === 'pending'
                    const isCompleted = order.status === 'completed'
                    const isRejected = order.status === 'rejected'
                    const isCancelled = order.status === 'cancelled'

                    const orderDate = new Date(order.orderedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })

                    const completedDate = order.completedAt
                      ? new Date(order.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : null

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-surface-alt/30 transition-colors"
                      >
                        {/* Order ID */}
                        <td className="px-4 py-3.5 font-mono text-[11.5px] text-secondary">
                          #{order.id}
                        </td>

                        {/* Date Claimed */}
                        <td className="px-4 py-3.5 text-muted text-[12px]">
                          {orderDate}
                        </td>

                        {/* Employee Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-surface-alt border border-border flex items-center justify-center text-[11px] font-bold text-secondary">
                              {order.employeeName
                                ? order.employeeName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                : 'EM'}
                            </div>
                            <span className="font-semibold text-primary">
                              {order.employeeName}
                            </span>
                          </div>
                        </td>

                        {/* Claimed Reward */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[18px]">{order.productEmoji}</span>
                            <div>
                              <span className="font-medium text-primary">
                                {order.productName}
                              </span>
                              {order.category && (
                                <span className="block text-[10.5px] text-muted">
                                  {order.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Points Cost */}
                        <td className="px-4 py-3.5 font-mono font-bold text-gold">
                          🪙 {order.pointsCost.toLocaleString('en-US')} pts
                          {(isCancelled || isRejected) && (
                            <span className="block font-sans text-[10px] font-semibold text-accent">
                              (Refunded)
                            </span>
                          )}
                        </td>

                        {/* Status Chip */}
                        <td className="px-4 py-3.5">
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
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-danger/10 text-danger border border-danger/20 whitespace-nowrap">
                              ✕ Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-alt text-secondary border border-border whitespace-nowrap">
                              ⊘ Cancelled
                            </span>
                          )}
                        </td>

                        {/* Fulfillment Info */}
                        <td className="px-4 py-3.5 text-[11.5px] text-secondary">
                          {isPending ? (
                            <span className="text-muted italic">Awaiting handover</span>
                          ) : isCompleted ? (
                            <span>
                              {order.fulfilledBy || 'Manager'}
                              {completedDate && (
                                <span className="text-muted text-[11px] block">
                                  on {completedDate}
                                </span>
                              )}
                            </span>
                          ) : isRejected ? (
                            <div>
                              <span className="font-semibold text-danger">
                                Rejected by {order.rejectedBy || 'Manager'}
                              </span>
                              {order.rejectionReason && (
                                <span className="text-muted text-[11px] block mt-0.5 line-clamp-2" title={order.rejectionReason}>
                                  &ldquo;{order.rejectionReason}&rdquo;
                                </span>
                              )}
                              <span className="text-[10px] text-accent font-medium block mt-0.5">
                                Points refunded
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-secondary">
                                Cancelled by employee
                              </span>
                              {order.cancelledAt && (
                                <span className="text-muted text-[11px] block">
                                  on {new Date(order.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                              <span className="text-[10px] text-accent font-medium block mt-0.5">
                                Points refunded
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Action Column */}
                        {!readOnly && (
                          <td className="px-4 py-3.5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setFulfillingOrder(order)}
                                  className="bg-accent hover:opacity-90 text-white font-semibold text-[11.5px] rounded-lg px-2.5 py-1.5 transition-opacity cursor-pointer shadow-xs whitespace-nowrap"
                                >
                                  Fulfill
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setRejectingOrder(order)}
                                  className="border border-danger/30 text-danger hover:bg-danger/10 font-semibold text-[11.5px] rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer whitespace-nowrap"
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
      </div>

      {/* Confirmation Modal */}
      {fulfillingOrder && (
        <ConfirmFulfillOrderModal
          order={fulfillingOrder}
          managerName={managerName}
          onCancel={() => setFulfillingOrder(null)}
          onConfirm={handleConfirmFulfill}
        />
      )}

      {/* Rejection Modal */}
      {rejectingOrder && (
        <RejectOrderModal
          order={rejectingOrder}
          roleTitle="Store Manager"
          onCancel={() => setRejectingOrder(null)}
          onConfirm={handleConfirmReject}
        />
      )}
    </div>
  )
}
