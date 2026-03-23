'use client'

import { useState } from 'react'
import Panel from '@/components/Panel/Panel'
import styles from './CoachingMoments.module.css'

type PillVariant = 'hosp' | 'checkout' | 'time'
type StatusVariant = 'active' | 'done'

interface CoachingItem {
  id: string
  type: PillVariant
  typeLabel: string
  title: string
  status: StatusVariant
  statusLabel: string
  what: React.ReactNode
  tip: React.ReactNode
  defaultOpen?: boolean
}

const ITEMS: CoachingItem[] = [
  {
    id: 'checkout',
    type: 'checkout',
    typeLabel: 'Checkout',
    title: 'Reduce checkout time to under 25s consistently',
    status: 'active',
    statusLabel: 'In progress',
    defaultOpen: true,
    what: (
      <>
        Your average checkout is <strong>31s</strong>, and your target is <strong>25s</strong>. You&apos;ve
        improved from 38s in November — that&apos;s real progress. The gap now is during high-volume windows
        where you slow down under pressure.
      </>
    ),
    tip: (
      <>
        💡 <strong>Try this:</strong> Before each transaction, position the bag before the first item scans.
        That one habit alone typically saves 4–6 seconds. Focus on it during your next lunch rush and see if it sticks.
      </>
    ),
  },
  {
    id: 'hosp',
    type: 'hosp',
    typeLabel: 'Hospitality',
    title: 'Maintain mid-transaction engagement — don\'t go quiet',
    status: 'active',
    statusLabel: 'In progress',
    what: (
      <>
        Your greeting and close scores are <strong>both above 85</strong> — that&apos;s excellent. The dip
        happens in the middle of transactions. Node 1 flags a pattern of silence during scanning, especially
        when lines are long.
      </>
    ),
    tip: (
      <>
        💡 <strong>Try this:</strong> Pick one phrase to use mid-scan — &quot;Did you find everything okay?&quot;
        or a simple comment about the weather. You don&apos;t need to be chatty, just present. Even one sentence
        during the transaction lifts your score noticeably.
      </>
    ),
  },
  {
    id: 'time',
    type: 'time',
    typeLabel: 'Time to Svc',
    title: 'First greeting under 2 seconds — already nearly there',
    status: 'done',
    statusLabel: '✓ Resolved',
    what: (
      <>
        This was flagged 6 weeks ago — your average greeting delay was <strong>4.8 seconds</strong>. As of
        this week you&apos;re averaging <strong>2.1 seconds</strong>, right at the target. Marked resolved.
        Great work.
      </>
    ),
    tip: <>✅ You nailed this one. Keep it up — consistency is what locks in permanent score improvement.</>,
  },
]

export default function CoachingMoments() {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(ITEMS.filter((i) => i.defaultOpen).map((i) => i.id))
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const badge = <span className={styles.badge}>2 active</span>

  return (
    <Panel title="Coaching Moments" subtitle="What to work on this week" badge={badge}>
      <div className={styles.list}>
        {ITEMS.map((item) => {
          const isOpen = openIds.has(item.id)
          return (
            <div key={item.id} className={styles.item}>
              <button
                className={`${styles.itemHeader} ${isOpen ? styles.itemHeaderOpen : ''}`}
                onClick={() => toggle(item.id)}
              >
                <span className={`${styles.pill} ${styles[item.type]}`}>{item.typeLabel}</span>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={`${styles.status} ${styles[item.status]}`}>{item.statusLabel}</span>
                <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
              </button>
              {isOpen && (
                <div className={styles.itemBody}>
                  <p className={styles.what}>{item.what}</p>
                  <div className={styles.tip}>{item.tip}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
