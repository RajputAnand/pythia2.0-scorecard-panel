'use client'

import { useState } from 'react'
import Panel from '@/components/Panel/Panel'
import styles from './CoachingMoments.module.css'
import { CoachingItem, PillVariant, StatusVariant } from '@/types/coaching'
import { COACHING_ITEMS } from '@/lib/coaching-item-data'

const pillClass: Record<PillVariant, string> = {
  hosp: 'bg-accent-light text-accent',
  checkout: 'bg-amber-light text-amber',
  time: 'bg-cobalt-light text-cobalt',
}

const statusClass: Record<StatusVariant, string> = {
  active: 'bg-amber-light text-amber',
  done: 'bg-accent-light text-accent',
}

/** Renders a string with **bold** markers as React nodes */
function renderText(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  )
}

export default function CoachingMoments() {
  const [items] = useState<CoachingItem[]>(COACHING_ITEMS)

  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(items.filter((i) => i.defaultOpen).map((i) => i.id))
  )

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const activeCount = items.filter((i) => i.status === 'active').length
  const badge = (
    <span className="bg-amber-light text-amber font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      {activeCount} active
    </span>
  )

  return (
    <Panel title="Coaching Moments" subtitle="What to work on this week" badge={badge}>
      <div className="flex flex-col gap-[10px]">
        {items.map((item: CoachingItem) => {
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
                    {renderText(item.what)}
                  </p>
                  <div className={`${styles.tip} bg-surface-alt rounded-lg text-secondary leading-relaxed text-[12px] px-[12px] py-[9px]`}>
                    {renderText(item.tip)}
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
