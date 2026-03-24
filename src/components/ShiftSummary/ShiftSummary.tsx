'use client'

import { useState } from 'react'
import Panel from '@/components/Panel/Panel'
import styles from './ShiftSummary.module.css'
import { ShiftSummaryData } from '@/types/shift'
import { SHIFT_SUMMARY_DATA } from '@/lib/shift-data'
import { renderText } from '@/utils/common'

const metricValClass: Record<string, string> = {
  good: 'text-accent',
  great: 'text-accent',
  ok: 'text-amber',
  gold: 'text-[var(--color-gold)]',
}

const metricChangeClass: Record<string, string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-muted',
}


export default function ShiftSummary() {
  const [data] = useState<ShiftSummaryData>(SHIFT_SUMMARY_DATA)

  const badge = data.shiftComplete ? (
    <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      Shift complete
    </span>
  ) : null

  return (
    <Panel title={data.title} subtitle={data.subtitle} badge={badge}>
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {data.metrics.map((m) => (
          <div key={m.label} className="flex flex-col bg-surface-alt rounded-[10px] px-[15px] py-[13px] gap-1">
            <div className="uppercase tracking-[.08em] text-muted text-[10px]">{m.label}</div>
            <div className={`font-mono font-bold leading-none text-[22px] ${metricValClass[m.valueClass]}`}>
              {m.value}
            </div>
            <div className={`font-semibold text-[11px] ${metricChangeClass[m.changeClass]}`}>
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col border border-border rounded-[10px] overflow-hidden mt-[14px]">
        {data.timeline.map((event) => (
          <div key={event.time} className="flex items-start gap-[10px] border-b border-border px-[14px] py-[10px] last:border-b-0">
            <div className="font-mono text-muted shrink-0 text-[10.5px] w-[38px] mt-px">{event.time}</div>
            <div
              className="rounded-full shrink-0 w-2 h-2 mt-1"
              style={{ background: event.dotColor }}
            />
            <div className={`${styles.eventText} text-secondary leading-snug flex-1 text-[12px]`}>
              {renderText(event.text)}
            </div>
            <div className="font-mono font-bold shrink-0 text-[12px]" style={{ color: event.scoreColor }}>
              {event.score}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
