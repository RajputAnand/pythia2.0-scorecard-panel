'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Panel from '@/components/shared/Panel/Panel'
import { useToast } from '@/context/ToastContext'
import type { SwagItem, SwagOrder } from '@/types/swagstore'
import { SWAG_STORE } from '@/lib/swagstore-data'
import { useSwagStore } from '@/store/swagStore'
import { useUserStore } from '@/store/userStore'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import ConfirmCancelOrderModal from './ConfirmCancelOrderModal'

const PREVIEW_POINTS = 1450
const PREVIEW_CATALOG: SwagItem[] = SWAG_STORE.catalog.map((item, i) => ({
  ...item,
  redeemed: i === 0,
}))

const CATEGORY_TABS = [
  'ALL',
  'Apparel',
  'Food & Drink',
  'Gift Cards',
  'Perks',
  'Lifestyle',
  'Merchandise',
]

interface SwagStoreProps {
  previewMode?: boolean
}

export default function SwagStore({ previewMode }: SwagStoreProps = {}) {
  const config = SWAG_STORE
  const pathname = usePathname()
  const isDedicatedPage = pathname?.includes('/swag')
  const { showToast } = useToast()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.employeeSwagStore] ?? true)

  const {
    catalog: storeItems,
    orders: allOrders,
    loading: storeLoading,
    error,
    redeemingId,
    fetchCatalog,
    redeemItem,
    cancelOrder,
  } = useSwagStore()
  const isError = !!error

  useEffect(() => {
    if (!previewMode) fetchCatalog()
  }, [fetchCatalog, previewMode])

  const storePoints = useUserStore((s) => s.points) ?? 0
  const { data: session } = useSession()
  const points = previewMode ? PREVIEW_POINTS : storePoints

  const currentEmployeeName = session?.user?.name || 'Marcus Reynolds'
  const currentEmployeeEmail = session?.user?.email || 'emp_marcus'

  // Sub-navigation tabs: Browse catalog vs My Orders
  const [activeViewTab, setActiveViewTab] = useState<'browse' | 'orders'>('browse')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [cancellingOrder, setCancellingOrder] = useState<SwagOrder | null>(null)

  // Filter orders for the active employee
  const myOrders = useMemo(() => {
    if (previewMode) {
      return [
        {
          id: 'ord_101',
          productId: 'tshirt',
          productName: 'Pythia Team T-Shirt',
          productEmoji: '🎽',
          category: 'Apparel',
          employeeId: 'emp_marcus',
          employeeName: currentEmployeeName,
          pointsCost: 800,
          status: 'pending' as const,
          orderedAt: '2026-06-12T14:30:00.000Z',
        },
      ]
    }
    return (allOrders ?? []).filter((order) => {
      if (!order) return false
      return (
        order.employeeId === currentEmployeeEmail ||
        order.employeeName === currentEmployeeName ||
        order.employeeName === 'Marcus Reynolds' ||
        order.employeeName === 'Marcus R.' ||
        order.employeeId === 'emp_marcus'
      )
    })
  }, [allOrders, currentEmployeeEmail, currentEmployeeName, previewMode])

  const myPendingOrders = useMemo(
    () => (myOrders ?? []).filter((o) => o?.status === 'pending'),
    [myOrders]
  )

  const myCompletedOrders = useMemo(
    () => (myOrders ?? []).filter((o) => o?.status === 'completed'),
    [myOrders]
  )

  const myCancelledOrRejectedOrders = useMemo(
    () => (myOrders ?? []).filter((o) => o?.status === 'cancelled' || o?.status === 'rejected'),
    [myOrders]
  )

  const activeCatalog = useMemo(() => {
    if (previewMode) return PREVIEW_CATALOG
    return (storeItems ?? []).filter((item) => item && item.status !== 'archived')
  }, [storeItems, previewMode])

  const filteredCatalog = useMemo(() => {
    return activeCatalog.filter((item) => {
      if (!item) return false
      const matchesCategory =
        selectedCategory === 'ALL' || item.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        q === '' ||
        item.name?.toLowerCase().includes(q) ||
        item.desc?.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
      return matchesCategory && matchesSearch
    })
  }, [activeCatalog, selectedCategory, searchQuery])

  const earnRateHtml = useMemo(() => {
    const raw = config?.earnRateText || 'You earn **~120 pts/shift** at your current score level.'
    return raw.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="text-white/70 font-semibold">$1</strong>'
    )
  }, [config?.earnRateText])

  // If on overview page and hidden by Super Admin KPI settings, respect toggle
  if (!previewMode && !isDedicatedPage && !visible) return null

  // Skeleton fallback before client hydration completes
  if (!previewMode && !mounted) {
    return (
      <Panel title={config.title} subtitle={config.subtitle} noPadding>
        <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-surface-alt/30 animate-pulse">
          <div className="h-6 w-44 rounded bg-border" />
          <div className="h-4 w-40 rounded bg-border hidden sm:block" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-border/50 border border-border" />
          ))}
        </div>
      </Panel>
    )
  }

  const isLoading = previewMode ? false : storeLoading

  async function handleRedeem(item: SwagItem) {
    if (previewMode) return
    if (item.stock === 0) {
      showToast(`"${item.name}" is currently out of stock.`)
      return
    }
    if (points < item.cost || redeemingId) return

    const success = await redeemItem(item, currentEmployeeName, currentEmployeeEmail)

    if (success) {
      const remaining = useUserStore.getState().points ?? 0
      showToast(
        `${item.emoji} "${item.name}" claimed! ${remaining.toLocaleString(
          'en-US'
        )} pts remaining. Awaiting manager handover.`
      )
    } else {
      showToast(`Failed to redeem "${item.name}". Please try again.`)
    }
  }

  function handleConfirmCancel() {
    if (!cancellingOrder) return
    const res = cancelOrder(cancellingOrder.id, currentEmployeeName)
    if (res.success) {
      showToast(
        `Order #${cancellingOrder.id} cancelled. ${cancellingOrder.pointsCost.toLocaleString('en-US')} pts refunded to your balance!`
      )
    } else {
      showToast(res.reason || 'Failed to cancel order.')
    }
    setCancellingOrder(null)
  }

  return (
    <>
      <Panel title={config.title} subtitle={config.subtitle} noPadding>
      {/* ── Points & Status Banner ──────────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-5 py-3.5 gap-3"
        style={{ background: 'linear-gradient(135deg, #1A1714, #2A2010)' }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-[7px]">
            {isLoading ? (
              <span
                className="font-mono font-bold text-[24px] animate-pulse"
                style={{ color: '#F5C842' }}
              >
                —
              </span>
            ) : (
              <span
                className="font-mono font-bold text-[24px]"
                style={{ color: '#F5C842' }}
              >
                {points.toLocaleString('en-US')}
              </span>
            )}
            <span className="text-[12px] font-medium text-white/50">
              points available
            </span>
          </div>

          {/* Pending Orders Pill Button */}
          {myPendingOrders.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveViewTab('orders')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-light text-amber border border-amber/30 cursor-pointer hover:bg-amber-light/80 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0 animate-pulse" />
              {myPendingOrders.length} pending handover
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div
            className="text-[11px] leading-tight text-white/40"
            dangerouslySetInnerHTML={{ __html: earnRateHtml }}
          />
        </div>
      </div>

      {/* ── Sub-navigation: Catalog vs Claimed Orders ───────────────────── */}
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5 bg-surface-alt/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveViewTab('browse')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
              activeViewTab === 'browse'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface-alt'
            }`}
          >
            <span>🎁 Available Rewards</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeViewTab === 'browse'
                  ? 'bg-white/20 text-white'
                  : 'bg-surface border border-border text-secondary'
              }`}
            >
              {activeCatalog.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveViewTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer ${
              activeViewTab === 'orders'
                ? 'bg-primary text-white shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface-alt'
            }`}
          >
            <span>📦 My Claimed Rewards</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeViewTab === 'orders'
                  ? 'bg-white/20 text-white'
                  : myPendingOrders.length > 0
                  ? 'bg-amber-light text-amber border border-amber/30'
                  : 'bg-surface border border-border text-secondary'
              }`}
            >
              {myOrders.length}
            </span>
          </button>
        </div>

        {/* Quick hint */}
        <span className="hidden md:inline-block text-[11px] text-muted">
          {activeViewTab === 'browse'
            ? 'Rewards are delivered to your store manager for handover'
            : 'Track fulfillment and manager handover status'}
        </span>
      </div>

      {/* ── Error state ───────────────────────────────────────────────── */}
      {isError && (
        <div
          className="px-5 py-2 text-[11.5px] font-medium border-b border-border"
          style={{ background: 'rgba(220,53,69,0.12)', color: '#f87171' }}
        >
          Failed to load rewards. Please refresh.
        </div>
      )}

      {/* ── TAB 1: BROWSE REWARDS CATALOG ──────────────────────────────── */}
      {activeViewTab === 'browse' && (
        <div>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-5 py-3 gap-3 bg-surface">
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORY_TABS.map((cat) => {
                const isSelected = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-accent text-white font-semibold'
                        : 'bg-surface-alt text-secondary hover:text-primary hover:bg-surface-alt/80 border border-border'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Rewards' : cat}
                  </button>
                )
              })}
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search rewards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-border bg-surface text-primary focus:outline-hidden focus:border-accent"
              />
              <svg
                className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5 animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border p-4 flex flex-col gap-3 bg-surface"
                >
                  <div className="h-7 w-7 rounded bg-border" />
                  <div className="h-4 w-3/4 rounded bg-border" />
                  <div className="h-3 w-full rounded bg-border" />
                  <div className="h-3 w-1/2 rounded bg-border" />
                  <div className="h-8 w-full rounded-lg bg-border mt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filteredCatalog.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-16 text-center">
              <span className="text-[36px]">🛍️</span>
              <p className="font-semibold text-[13.5px] text-primary">
                No matching rewards found
              </p>
              <p className="text-[12px] text-muted max-w-xs">
                {searchQuery || selectedCategory !== 'ALL'
                  ? 'Try changing your category filter or search term.'
                  : 'Check back soon as your manager and owner add new items.'}
              </p>
            </div>
          )}

          {/* Catalog grid */}
          {!isLoading && filteredCatalog.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-surface-alt/10">
              {filteredCatalog.map((item) => {
                const canAfford = points >= item.cost
                const needed = item.cost - points
                const isRedeeming = redeemingId === item.id

                // Check if this employee already has an active pending order for this product
                const hasPendingOrder = myPendingOrders.some(
                  (o) => o?.productId === item.id
                )

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-border bg-surface p-4.5 gap-3 hover:border-accent/40 transition-colors shadow-2xs"
                  >
                    <div>
                      {/* Top bar: Emoji & Tags */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[28px]">{item.emoji}</span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {item.category && (
                            <span className="text-[10px] font-semibold text-secondary uppercase tracking-[.05em] bg-surface-alt px-2 py-0.5 rounded-md border border-border">
                              {item.category}
                            </span>
                          )}

                          {item.stock != null ? (
                            item.stock > 0 ? (
                              <span className="text-[10px] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-md">
                                {item.stock} left
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-danger bg-danger/10 px-2 py-0.5 rounded-md">
                                Out of Stock
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] font-medium text-muted bg-surface-alt px-1.5 py-0.5 rounded-md">
                              Unlimited
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-[13.5px] font-bold text-primary leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[11.5px] text-muted leading-snug mt-1 line-clamp-2">
                        {item.desc}
                      </p>
                    </div>

                    {/* Price, Status & Button */}
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[13px] font-bold text-gold">
                          🪙 {item.cost.toLocaleString('en-US')} pts
                        </span>

                        {hasPendingOrder && (
                          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-amber bg-amber-light border border-amber/30 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
                            1 Pending Handover
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      {isRedeeming ? (
                        <button
                          disabled
                          className="w-full rounded-lg py-2 text-[12px] font-semibold text-white bg-accent opacity-70 animate-pulse cursor-default"
                        >
                          Redeeming…
                        </button>
                      ) : item.stock === 0 ? (
                        <button
                          disabled
                          className="w-full rounded-lg py-2 text-[12px] font-semibold text-muted bg-surface-alt cursor-default opacity-75"
                        >
                          Out of Stock
                        </button>
                      ) : canAfford ? (
                        <button
                          type="button"
                          onClick={() => handleRedeem(item)}
                          disabled={!!redeemingId}
                          className="w-full rounded-lg py-2 text-[12px] font-semibold text-white bg-accent hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                          Redeem Reward
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full rounded-lg py-2 text-[11.5px] font-semibold text-muted bg-surface-alt cursor-default border border-border"
                        >
                          Need {needed.toLocaleString('en-US')} more pts
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: MY CLAIMED REWARDS / ORDERS ─────────────────────────── */}
      {activeViewTab === 'orders' && (
        <div className="p-5 flex flex-col gap-5">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-surface p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-[.06em]">
                Available Balance
              </span>
              <span className="text-[18px] font-mono font-bold text-gold">
                🪙 {points.toLocaleString('en-US')} pts
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-[.06em]">
                Total Claimed
              </span>
              <span className="text-[18px] font-mono font-bold text-primary">
                {myOrders.length} rewards
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-[.06em]">
                Pending Handover
              </span>
              <span className="text-[18px] font-mono font-bold text-amber">
                {myPendingOrders.length} orders
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface p-3.5 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-secondary uppercase tracking-[.06em]">
                Fulfilled by Manager
              </span>
              <span className="text-[18px] font-mono font-bold text-accent">
                {myCompletedOrders.length} orders
              </span>
            </div>
          </div>

          {/* Orders Table or Empty State */}
          {myOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-border rounded-xl bg-surface">
              <span className="text-[36px] mb-2">🎁</span>
              <h3 className="font-bold text-[14px] text-primary">
                No claimed rewards yet
              </h3>
              <p className="text-[12px] text-muted mt-1 max-w-sm">
                You have {points.toLocaleString('en-US')} points available to redeem. Browse the catalog to claim your first reward!
              </p>
              <button
                type="button"
                onClick={() => setActiveViewTab('browse')}
                className="mt-4 bg-accent hover:opacity-90 text-white font-semibold text-[12px] rounded-lg px-4 py-2 transition-opacity cursor-pointer shadow-xs"
              >
                Browse Rewards Catalog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full border-collapse text-left text-[12px]">
                <thead>
                  <tr className="bg-surface-alt/70 text-secondary text-[11px] font-semibold uppercase tracking-[.06em] border-b border-border">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date Claimed</th>
                    <th className="px-4 py-3">Claimed Reward</th>
                    <th className="px-4 py-3">Points Deducted</th>
                    <th className="px-4 py-3">Fulfillment Status</th>
                    <th className="px-4 py-3">Handover Details</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myOrders.map((order) => {
                    const isPending = order?.status === 'pending'
                    const isCompleted = order?.status === 'completed'
                    const isRejected = order?.status === 'rejected'
                    const isCancelled = order?.status === 'cancelled'

                    const orderDate = order?.orderedAt
                      ? new Date(order.orderedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'
                    const completedDate = order?.completedAt
                      ? new Date(order.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
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

                        {/* Reward */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[20px]">{order.productEmoji}</span>
                            <div>
                              <span className="font-semibold text-primary">
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
                          🪙 {(order.pointsCost ?? 0).toLocaleString('en-US')} pts
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
                              ✓ Fulfilled
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

                        {/* Handover Details */}
                        <td className="px-4 py-3.5 text-[11.5px] text-secondary">
                          {isPending ? (
                            <span className="text-muted italic">
                              Awaiting handover by store manager
                            </span>
                          ) : isCompleted ? (
                            <div>
                              <span className="font-medium text-accent">
                                Handed over by {order.fulfilledBy || 'Manager'}
                              </span>
                              {completedDate && (
                                <span className="text-muted text-[10.5px] block">
                                  on {completedDate}
                                </span>
                              )}
                            </div>
                          ) : isRejected ? (
                            <div>
                              <span className="font-semibold text-danger">
                                Rejected by {order.rejectedBy || 'Manager'}
                              </span>
                              {order.rejectionReason && (
                                <div className="mt-1 text-[11px] text-secondary bg-danger/5 border border-danger/20 rounded-md px-2 py-1 leading-snug">
                                  <span className="font-semibold text-danger">Reason:</span> &ldquo;{order.rejectionReason}&rdquo;
                                </div>
                              )}
                              <span className="text-muted text-[10.5px] block mt-1">
                                🪙 {(order.pointsCost ?? 0).toLocaleString('en-US')} pts refunded
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-secondary">
                                Cancelled by you
                              </span>
                              {order.cancelledAt && (
                                <span className="text-muted text-[10.5px] block">
                                  on {new Date(order.cancelledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                              <span className="text-muted text-[10.5px] block mt-0.5">
                                🪙 {(order.pointsCost ?? 0).toLocaleString('en-US')} pts refunded
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Action Column */}
                        <td className="px-4 py-3.5 text-right">
                          {isPending ? (
                            <button
                              type="button"
                              onClick={() => setCancellingOrder(order)}
                              className="inline-flex items-center gap-1 rounded-lg border border-danger/30 bg-surface px-2.5 py-1 text-[11px] font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            >
                              Cancel Claim
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted italic">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Panel>

    {cancellingOrder && (
      <ConfirmCancelOrderModal
        order={cancellingOrder}
        onCancel={() => setCancellingOrder(null)}
        onConfirm={handleConfirmCancel}
      />
    )}
  </>
  )
}
