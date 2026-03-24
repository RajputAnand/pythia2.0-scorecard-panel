'use client'

import { useState } from 'react'
import Panel from '@/components/Panel/Panel'
import styles from './SwagStore.module.css'
import { useToast } from '@/context/ToastContext'

interface SwagItem {
  id: string
  emoji: string
  name: string
  desc: string
  cost: number
  redeemed?: boolean
}

const INITIAL_ITEMS: SwagItem[] = [
  { id: 'coffee', emoji: '☕', name: 'Free Coffee — Any Size', desc: 'Redeem at the register anytime during your shift', cost: 250 },
  { id: 'tshirt', emoji: '🎽', name: 'Pythia Team T-Shirt', desc: 'Limited edition — only for top performers', cost: 800 },
  { id: 'gift10', emoji: '🎟️', name: '$10 Gift Card', desc: 'Store gift card — use on anything in the store', cost: 1000 },
  { id: 'cap', emoji: '🧢', name: 'Pythia Cap', desc: 'Embroidered logo cap — show off your rank', cost: 600 },
  { id: 'halfday', emoji: '🏖️', name: 'Half Day Off', desc: 'Redeem for a 4-hour shift reduction — manager approved', cost: 2000 },
  { id: 'gift25', emoji: '🎮', name: '$25 Amazon Gift Card', desc: 'Digital delivery within 24 hours of redemption', cost: 2500 },
]

export default function SwagStore() {
  const [points, setPoints] = useState(1840)
  const [items, setItems] = useState<SwagItem[]>(INITIAL_ITEMS)
  const { showToast } = useToast()

  function redeem(item: SwagItem) {
    if (points < item.cost || item.redeemed) return
    const newPoints = points - item.cost
    setPoints(newPoints)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, redeemed: true } : i))
    showToast(`${item.emoji} ${item.name} redeemed! ${newPoints.toLocaleString()} pts remaining`)
  }

  return (
    <Panel title="Swag Store" subtitle="Redeem your points for rewards" noPadding>
      {/* Points header */}
      <div
        className="flex items-center justify-between border-b border-border px-5 py-3"
        style={{ background: 'linear-gradient(135deg, #1A1714, #2A2010)' }}
      >
        <div className="flex items-baseline gap-[6px]">
          <span className="font-mono font-bold text-[22px]" style={{ color: '#F5C842' }}>
            {points.toLocaleString()}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11.5px' }}>points available</span>
        </div>
        <div className={`${styles.earnRate} text-[11px]`} style={{ color: 'rgba(255,255,255,0.35)' }}>
          You earn <strong>~120 pts/shift</strong> at your current score level. Higher score = more points per shift.
        </div>
      </div>

      {/* Grid */}
      <div className={`${styles.grid} grid grid-cols-3`}>
        {items.map((item) => {
          const canAfford = points >= item.cost
          const needed = item.cost - points
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
              ) : canAfford ? (
                <button
                  className="cursor-pointer font-sans font-semibold rounded-[7px] text-center border-0 transition-all duration-150 text-[11.5px] px-[10px] py-[6px] bg-accent text-white hover:opacity-85"
                  onClick={() => redeem(item)}
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
