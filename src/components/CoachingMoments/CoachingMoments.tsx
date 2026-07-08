'use client'

import { useState } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import styles from './CoachingMoments.module.css'
import { CoachingMoment } from '@/types/overview'
import { renderText } from '@/utils/common'

const CATEGORY_COLORS = [
  'bg-accent-light text-accent',
  'bg-amber-light text-amber',
  'bg-cobalt-light text-cobalt',
  'bg-purple-light text-purple',
]

function categoryClass(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}

const statusMeta: Record<CoachingMoment['status'], { label: string; className: string }> = {
  in_progress: { label: 'In Progress', className: 'bg-amber-light text-amber' },
  declining: { label: 'Declining', className: 'bg-danger-light text-danger' },
  stalled: { label: 'Stalled', className: 'bg-danger-light text-danger' },
  resolved: { label: '✓ Resolved', className: 'bg-accent-light text-accent' },
}

const DEFAULT_STATUS_META = { label: 'In Progress', className: 'bg-amber-light text-amber' }

export default function CoachingMoments({ items }: { items: CoachingMoment[] }) {

  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(items[0] ? [items[0].record_id] : [])
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeCount = items.filter((i) => i.status !== 'resolved').length
  const badge = (
    <span className="bg-amber-light text-amber font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      {activeCount} active
    </span>
  )

  return (
    <Panel title="Coaching Moments" subtitle="What to work on this week" badge={badge}>
      <div className="flex flex-col gap-[10px]">
        {items.map((item) => {
          const isOpen = openIds.has(item.record_id)
          const status = statusMeta[item.status] ?? DEFAULT_STATUS_META
          return (
            <div key={item.record_id} className="border border-border rounded-[11px] overflow-hidden">
              <button
                className={`w-full flex items-start gap-[10px] cursor-pointer text-left bg-transparent border-0 px-[14px] py-[12px] hover:bg-surface-alt ${isOpen ? 'bg-surface-alt' : ''}`}
                onClick={() => toggle(item.record_id)}
              >
                <span className={`font-bold uppercase tracking-[.06em] rounded-[5px] whitespace-nowrap shrink-0 text-[9.5px] px-[8px] py-[2px] mt-[2px] ${categoryClass(item.category)}`}>
                  {item.category}
                </span>
                <span className="font-semibold flex-1 leading-snug text-[12.5px]">{item.title}</span>
                <span className={`font-semibold rounded-[20px] whitespace-nowrap shrink-0 text-[10.5px] px-[8px] py-[2px] ${status.className}`}>
                  {status.label}
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
                    {renderText(item.description)}
                  </p>
                  <div className={`${styles.tip} bg-surface-alt rounded-lg text-secondary leading-relaxed text-[12px] px-[12px] py-[9px]`}>
                    {item.callout_type === 'compliment' ? '✅ ' : '💡 '}
                    {renderText(item.callout_text)}
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
