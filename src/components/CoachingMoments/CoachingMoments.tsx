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

const pillClass: Record<PillVariant, string> = {
  hosp: 'bg-accent-light text-accent',
  checkout: 'bg-amber-light text-amber',
  time: 'bg-cobalt-light text-cobalt',
}

const statusClass: Record<StatusVariant, string> = {
  active: 'bg-amber-light text-amber',
  done: 'bg-accent-light text-accent',
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

  const badge = (
    <span className="bg-amber-light text-amber font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      2 active
    </span>
  )

  return (
    <Panel title="Coaching Moments" subtitle="What to work on this week" badge={badge}>
      <div className="flex flex-col gap-[10px]">
        {ITEMS.map((item) => {
          const isOpen = openIds.has(item.id)
          return (
            <div key={item.id} className="border border-border rounded-[11px] overflow-hidden">
              <button
                className={`w-full flex items-start gap-[10px] cursor-pointer text-left bg-transparent border-0 px-[14px] py-[12px] hover:bg-surface-alt ${isOpen ? 'bg-surface-alt' : ''}`}
                onClick={() => toggle(item.id)}
              >
                <span className={`font-bold uppercase tracking-[.06em] rounded-[5px] whitespace-nowrap shrink-0 text-[9.5px] px-[8px] py-[2px] mt-[2px] ${pillClass[item.type]}`}>
                  {item.typeLabel}
                </span>
                <span className="font-semibold flex-1 leading-snug text-[12.5px]">{item.title}</span>
                <span className={`font-semibold rounded-[20px] whitespace-nowrap shrink-0 text-[10.5px] px-[8px] py-[2px] ${statusClass[item.status]}`}>
                  {item.statusLabel}
                </span>
                <span
                  className="text-muted shrink-0 text-[12px] transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                >
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="px-[14px] pb-[13px]">
                  <p className={`${styles.what} text-secondary leading-relaxed text-[12px] mb-[10px]`}>
                    {item.what}
                  </p>
                  <div className={`${styles.tip} bg-surface-alt rounded-lg text-secondary leading-relaxed text-[12px] px-[12px] py-[9px]`}>
                    {item.tip}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
