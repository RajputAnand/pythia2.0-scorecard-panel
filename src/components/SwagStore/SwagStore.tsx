'use client'

import { useEffect } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import styles from './SwagStore.module.css'
import { useToast } from '@/context/ToastContext'
import { SwagItem } from '@/types/swagstore'
import { SWAG_STORE } from '@/lib/swagstore-data'
import { renderText } from '@/utils/common'
import { useSwagStore } from '@/store/swagStore'

export default function SwagStore() {
  const config = SWAG_STORE
  const points = useSwagStore((s) => s.points)
  const items = useSwagStore((s) => s.items)
  const loading = useSwagStore((s) => s.loading)
  const redeemingId = useSwagStore((s) => s.redeemingId)
  const error = useSwagStore((s) => s.error)
  const fetchPoints = useSwagStore((s) => s.fetchPoints)
  const redeemItem = useSwagStore((s) => s.redeem)
  const { showToast } = useToast()

  useEffect(() => {
    fetchPoints()
  }, [fetchPoints])

  async function redeem(item: SwagItem) {
    const success = await redeemItem(item)
    if (success) {
      const newPoints = points - item.cost
      showToast(`${item.emoji} ${item.name} redeemed! ${newPoints.toLocaleString()} pts remaining`)
    }
  }

  return (
    <Panel title={config.title} subtitle={config.subtitle} noPadding>
      {/* Points header */}
      <div
        className="flex items-center justify-between border-b border-border px-5 py-3"
        style={{ background: 'linear-gradient(135deg, #1A1714, #2A2010)' }}
      >
        <div className="flex items-baseline gap-[6px]">
          {loading ? (
            <span className="font-mono font-bold text-[22px] animate-pulse" style={{ color: '#F5C842' }}>—</span>
          ) : (
            <span className="font-mono font-bold text-[22px]" style={{ color: '#F5C842' }}>
              {points.toLocaleString()}
            </span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11.5px' }}>points available</span>
        </div>
        <div className={`${styles.earnRate} text-[11px]`} style={{ color: 'rgba(255,255,255,0.35)' }}>
          {renderText(config.earnRateText)}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-5 py-2 text-[11.5px] font-medium" style={{ background: 'rgba(220,53,69,0.12)', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Grid */}
      <div className={`${styles.grid} grid grid-cols-3`}>
        {items.map((item) => {
          const canAfford = points >= item.cost
          const needed = item.cost - points
          const isRedeeming = redeemingId === item.id
          return (
            <div key={item.id} className={`${styles.item} flex flex-col border-r border-b border-border px-[16px] py-[14px] gap-2`}>
              <span className="text-[24px]">{item.emoji}</span>
              <p className="font-semibold leading-tight text-[12.5px]">{item.name}</p>
              <p className="text-muted leading-snug text-[11px]">{item.desc}</p>
              <p className="font-mono font-bold text-gold text-[12px]">{item.cost.toLocaleString()} pts</p>
              {item.redeemed ? (
                <button className="cursor-default font-sans font-semibold rounded-[7px] text-center border-0 transition-all duration-150 text-[11.5px] px-[10px] py-[6px] bg-accent-light text-accent" disabled>
                  ✓ Redeemed
                </button>
              ) : isRedeeming ? (
                <button className="cursor-default font-sans font-semibold rounded-[7px] text-center border-0 text-[11.5px] px-[10px] py-[6px] bg-accent text-white opacity-70 animate-pulse" disabled>
                  Redeeming…
                </button>
              ) : canAfford ? (
                <button
                  className="cursor-pointer font-sans font-semibold rounded-[7px] text-center border-0 transition-all duration-150 text-[11.5px] px-[10px] py-[6px] bg-accent text-white hover:opacity-85 disabled:cursor-default disabled:opacity-50"
                  onClick={() => redeem(item)}
                  disabled={!!redeemingId}
                >
                  Redeem
                </button>
              ) : (
                <button className="cursor-default font-sans font-semibold rounded-[7px] text-center border-0 transition-all duration-150 text-[11.5px] px-[10px] py-[6px] bg-surface-alt text-muted" disabled>
                  Need {needed.toLocaleString()} more
                </button>
              )}
            </div>
          )
        })}
      </div>

    </Panel>
  )
}
