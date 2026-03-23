'use client'

import { useState } from 'react'
import panelStyles from '@/components/Panel/Panel.module.css'
import styles from './SwagStore.module.css'

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
  const [toast, setToast] = useState<string | null>(null)

  function redeem(item: SwagItem) {
    if (points < item.cost || item.redeemed) return
    const newPoints = points - item.cost
    setPoints(newPoints)
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, redeemed: true } : i))
    showToast(`${item.emoji} ${item.name} redeemed! ${newPoints.toLocaleString()} pts remaining`)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <div>
          <p className={panelStyles.title}>Swag Store</p>
          <p className={panelStyles.sub}>Redeem your points for rewards</p>
        </div>
      </div>

      {/* Points header */}
      <div className={styles.pointsHeader}>
        <div className={styles.pointsAvailable}>
          <span className={styles.pointsNum}>{points.toLocaleString()}</span>
          <span className={styles.pointsText}>points available</span>
        </div>
        <div className={styles.earnRate}>
          You earn <strong>~120 pts/shift</strong> at your current score level. Higher score = more points per shift.
        </div>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {items.map((item) => {
          const canAfford = points >= item.cost
          const needed = item.cost - points
          return (
            <div key={item.id} className={styles.item}>
              <span className={styles.emoji}>{item.emoji}</span>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.desc}>{item.desc}</p>
              <p className={styles.cost}>{item.cost.toLocaleString()} pts</p>
              {item.redeemed ? (
                <button className={`${styles.btn} ${styles.btnRedeemed}`} disabled>✓ Redeemed</button>
              ) : canAfford ? (
                <button className={`${styles.btn} ${styles.btnAfford}`} onClick={() => redeem(item)}>Redeem</button>
              ) : (
                <button className={`${styles.btn} ${styles.btnCant}`} disabled>Need {needed.toLocaleString()} more</button>
              )}
            </div>
          )
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>
          <span>🎉</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
