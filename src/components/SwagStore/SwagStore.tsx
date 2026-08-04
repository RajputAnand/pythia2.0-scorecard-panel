'use client'

import { useEffect } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import styles from './SwagStore.module.css'
import { useToast } from '@/context/ToastContext'
import type { SwagItem } from '@/types/swagstore'
import { SWAG_STORE } from '@/lib/swagstore-data'
import { renderText } from '@/utils/common'
import { useSwagStore } from '@/store/swagStore'
import { useUserStore } from '@/store/userStore'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

// Illustrative points balance + catalog states for the Super Admin hover
// preview — the real catalog (SWAG_STORE) already has realistic pricing, so
// this only needs to fake a points balance and a couple of redeemed items to
// show all four card states at a glance.
const PREVIEW_POINTS = 1450
const PREVIEW_CATALOG: SwagItem[] = SWAG_STORE.catalog.map((item, i) => ({
  ...item,
  redeemed: i === 0,
}))

interface SwagStoreProps {
  previewMode?: boolean
}

export default function SwagStore({ previewMode }: SwagStoreProps = {}) {
  const config = SWAG_STORE
  const { showToast } = useToast()
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.employeeSwagStore] ?? true)

  const { catalog: storeItems, loading: storeLoading, error, redeemingId, fetchCatalog, redeemItem } = useSwagStore()
  const isError = !!error

  useEffect(() => {
    if (!previewMode) fetchCatalog()
  }, [fetchCatalog, previewMode])

  const storePoints = useUserStore((s) => s.points) ?? 0

  if (!previewMode && !visible) return null

  const items = previewMode ? PREVIEW_CATALOG : storeItems
  const isLoading = previewMode ? false : storeLoading
  const points = previewMode ? PREVIEW_POINTS : storePoints

  async function handleRedeem(item: SwagItem) {
    if (previewMode) return
    if (points < item.cost || item.redeemed || redeemingId) return
    const success = await redeemItem(item)
    if (success) {
      const remaining = useUserStore.getState().points ?? 0
      showToast(`${item.emoji} ${item.name} redeemed! ${remaining.toLocaleString()} pts remaining`)
    } else {
      showToast(`Failed to redeem "${item.name}". Please try again.`)
    }
  }

  return (
    <Panel title={config.title} subtitle={config.subtitle} noPadding>
      {/* ── Points header ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between border-b border-border px-5 py-3"
        style={{ background: 'linear-gradient(135deg, #1A1714, #2A2010)' }}
      >
        <div className="flex items-baseline gap-[6px]">
          {isLoading ? (
            <span className="font-mono font-bold text-[22px] animate-pulse" style={{ color: '#F5C842' }}>
              —
            </span>
          ) : (
            <span className="font-mono font-bold text-[22px]" style={{ color: '#F5C842' }}>
              {points.toLocaleString()}
            </span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11.5px' }}>points available</span>
        </div>

        <div className="flex items-center gap-3">
          <div className={`${styles.earnRate} text-[11px]`} style={{ color: 'rgba(255,255,255,0.35)' }}>
            {renderText(config.earnRateText)}
          </div>
        </div>
      </div>

      {/* ── Error state ───────────────────────────────────────────────── */}
      {isError && (
        <div
          className="px-5 py-2 text-[11.5px] font-medium"
          style={{ background: 'rgba(220,53,69,0.12)', color: '#f87171' }}
        >
          Failed to load rewards. Please refresh.
        </div>
      )}

      {/* ── Loading skeleton ──────────────────────────────────────────── */}
      {isLoading && (
        <div className="grid grid-cols-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col border-r border-b border-border px-[16px] py-[14px] gap-2"
            >
              <div className="h-6 w-6 rounded bg-border" />
              <div className="h-3 w-3/4 rounded bg-border" />
              <div className="h-2 w-full rounded bg-border" />
              <div className="h-2 w-1/2 rounded bg-border" />
              <div className="mt-1 h-7 w-full rounded-[7px] bg-border" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────── */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12">
          <span className="text-[32px]">🛍️</span>
          <p className="font-semibold text-[13px]">No rewards available</p>
          <p className="text-[11.5px] text-muted">Check back soon for new items.</p>
        </div>
      )}

      {/* ── Catalog grid ──────────────────────────────────────────────── */}
      {!isLoading && items.length > 0 && (
        <div className={`${styles.grid} grid grid-cols-3`}>
          {items.map((item) => {
            const canAfford = points >= item.cost
            const needed = item.cost - points
            const isRedeeming = redeemingId === item.id
            return (
              <div
                key={item.id}
                className={`${styles.item} flex flex-col border-r border-b border-border px-[16px] py-[14px] gap-2`}
              >
                <span className="text-[24px]">{item.emoji}</span>
                <p className="text-[12.5px] font-semibold leading-tight">{item.name}</p>
                <p className="text-[11px] leading-snug text-muted">{item.desc}</p>
                <p className="font-mono text-[12px] font-bold text-gold">{item.cost.toLocaleString()} pts</p>

                {/* Per-item action button — four exclusive states */}
                {isRedeeming ? (
                  <button
                    className="cursor-default animate-pulse rounded-[7px] border-0 px-[10px] py-[6px] text-[11.5px] font-semibold text-white opacity-70"
                    style={{ background: 'var(--color-accent)' }}
                    disabled
                  >
                    Redeeming…
                  </button>
                ) : item.redeemed ? (
                  <button
                    className="cursor-default rounded-[7px] border-0 px-[10px] py-[6px] text-[11.5px] font-semibold text-accent transition-all duration-150"
                    style={{ background: 'var(--color-accent-light)' }}
                    disabled
                  >
                    ✓ Redeemed
                  </button>
                ) : canAfford ? (
                  <button
                    className="cursor-pointer rounded-[7px] border-0 px-[10px] py-[6px] text-[11.5px] font-semibold text-white transition-all duration-150 hover:opacity-85 disabled:cursor-default disabled:opacity-50"
                    style={{ background: 'var(--color-accent)' }}
                    onClick={() => handleRedeem(item)}
                    disabled={!!redeemingId}
                  >
                    Redeem
                  </button>
                ) : (
                  <button
                    className="cursor-default rounded-[7px] border-0 px-[10px] py-[6px] text-[11.5px] font-semibold text-muted transition-all duration-150"
                    style={{ background: 'var(--color-surface-alt)' }}
                    disabled
                  >
                    Need {needed.toLocaleString()} more
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
