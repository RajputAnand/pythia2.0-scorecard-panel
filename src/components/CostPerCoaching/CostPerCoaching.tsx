'use client'

import { useState } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import { renderText } from '@/utils/common'
import { COST_PER_COACHING_DATA } from '@/lib/cost-per-coaching-data'
import type { CostPerCoachingData } from '@/types/cost-per-coaching'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const PREVIEW_DATA: CostPerCoachingData = {
  title: 'Cost Per Coaching Moment vs. Performance Gain',
  subtitle: 'How efficiently is each coaching dollar converting to score improvement?',
  badge: 'Team avg: $4.20/pt',
  items: [
    { name: 'Tara C.', cost: '$3.10', quality: 'good', gain: '+9 pts', gainType: 'up' },
    { name: 'Marcus R.', cost: '$3.80', quality: 'good', gain: '+7 pts', gainType: 'up' },
    { name: 'Devon W.', cost: '$4.50', quality: 'ok', gain: '+5 pts', gainType: 'up' },
    { name: 'Sofia K.', cost: '$5.20', quality: 'ok', gain: '+3 pts', gainType: 'up' },
    { name: 'Jamie L.', cost: '$7.90', quality: 'bad', gain: '0 pts', gainType: 'flat' },
  ],
  insightEmoji: '💡',
  insightText: "**Tara C.** is converting coaching dollars into score gains most efficiently on the team — **$3.10 per point**, well under the team average.",
}

const itemCostClass: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
}

const itemGainClass: Record<string, string> = {
  up: 'text-accent',
  flat: 'text-muted',
}

export default function CostPerCoaching({ previewMode }: { previewMode?: boolean } = {}) {
  const [realData] = useState<CostPerCoachingData>(COST_PER_COACHING_DATA)
  const data = previewMode ? PREVIEW_DATA : realData
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiCostPerCoaching] ?? true)

  if (!previewMode && !visible) return null

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
