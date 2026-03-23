import styles from './CostPerCoaching.module.css'

const ITEMS = [
  { name: 'Tara C.',   cost: '$0.84', quality: 'good', gain: '↑ +17 pts · 2 issues resolved', gainType: 'up' },
  { name: 'Marcus R.', cost: '$1.20', quality: 'good', gain: '↑ +12 pts · 3 resolved',         gainType: 'up' },
  { name: 'Devon W.',  cost: '$1.54', quality: 'good', gain: '↑ +10 pts · 2 resolved',         gainType: 'up' },
  { name: 'Sofia K.',  cost: '$3.20', quality: 'ok',   gain: '↑ +5 pts · 1 resolved',          gainType: 'up' },
  { name: 'Jamie L.',  cost: '$8.60', quality: 'bad',  gain: '→ −12 pts · 2 stalled',          gainType: 'flat' },
]

export default function CostPerCoaching() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>Cost Per Coaching Moment vs. Performance Gain</div>
          <div className={styles.cardSub}>How efficiently is each coaching dollar converting to score improvement?</div>
        </div>
        <div className={`${styles.badge} ${styles.positive}`}>Team avg: $2.14 / point gained</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.grid}>
          {ITEMS.map((item) => (
            <div key={item.name} className={styles.item}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={`${styles.itemCost} ${styles[item.quality as 'good' | 'ok' | 'bad']}`}>{item.cost}</div>
              <div className={styles.itemSub}>per score point gained</div>
              <div className={`${styles.itemGain} ${styles[item.gainType as 'up' | 'flat']}`}>{item.gain}</div>
            </div>
          ))}
        </div>
        <div className={styles.callout}>
          <span className={styles.calloutIcon}>💡</span>
          <p className={styles.calloutText}>
            Jamie&apos;s coaching cost is <strong>4× the team average</strong> with declining scores — a
            signal that AI coaching alone is not the right tool here. A single manager conversation
            (est. 30 min × $22/hr = <strong>$11</strong>) is more cost-effective than continued
            automated coaching at current trajectory.
          </p>
        </div>
      </div>
    </div>
  )
}
