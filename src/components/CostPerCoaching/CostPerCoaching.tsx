'use client'

import { useState } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import { renderText } from '@/utils/common'
import { COST_PER_COACHING_DATA } from '@/lib/cost-per-coaching-data'
import type { CostPerCoachingData } from '@/types/cost-per-coaching'

const itemCostClass: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
}

const itemGainClass: Record<string, string> = {
  up: 'text-accent',
  flat: 'text-muted',
}

export default function CostPerCoaching() {
  const [data] = useState<CostPerCoachingData>(COST_PER_COACHING_DATA)

  const badge = (
    <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
      {data.badge}
    </div>
  )

  return (
    <Panel title={data.title} subtitle={data.subtitle} badge={badge}>
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {data.items.map((item) => (
          <div key={item.name} className="bg-surface-alt rounded-[10px] flex flex-col gap-[5px] px-[14px] py-[12px]">
            <div className="font-semibold text-secondary text-[11px]">{item.name}</div>
            <div className={`font-mono font-semibold text-[17px] ${itemCostClass[item.quality]}`}>{item.cost}</div>
            <div className="text-muted text-[10px] leading-[1.4]">per score point gained</div>
            <div className={`text-[10.5px] font-semibold ${itemGainClass[item.gainType]}`}>{item.gain}</div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-[14px] px-[13px] py-[10px]">
        <span className="text-[13px] shrink-0 mt-px">{data.insightEmoji}</span>
        <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
          {renderText(data.insightText)}
        </p>
      </div>
    </Panel>
  )
}
