'use client'

import Panel from '@/components/shared/Panel/Panel'
import { renderText } from '@/utils/common'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { RoiAttributionResponse } from '@/types/owner-roi'

const itemCostClass: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
  no_data: 'text-muted',
}

const itemGainClass: Record<string, string> = {
  up: 'text-accent',
  flat: 'text-muted',
  down: 'text-danger',
}

import { COST_PER_COACHING_DATA } from '@/lib/cost-per-coaching-data'
import type { CostPerCoachingData } from '@/types/cost-per-coaching'

const PREVIEW_DATA: CostPerCoachingData = {
  title: 'Cost Per Coaching Moment vs. Performance Gain',
  subtitle: 'How efficiently is each coaching dollar converting to score improvement?',
  badge: 'Team avg: $4.20/1k pts',
  items: [
    { name: 'Tara C.', cost: '$3.10', quality: 'good', gain: '+9 pts', gainType: 'up' },
    { name: 'Marcus R.', cost: '$3.80', quality: 'good', gain: '+7 pts', gainType: 'up' },
    { name: 'Devon W.', cost: '$4.50', quality: 'ok', gain: '+5 pts', gainType: 'up' },
    { name: 'Sofia K.', cost: '$5.20', quality: 'ok', gain: '+3 pts', gainType: 'up' },
    { name: 'Jamie L.', cost: '$7.90', quality: 'bad', gain: '0 pts', gainType: 'flat' },
  ],
  insightEmoji: '💡',
  insightText: "**Tara C.** is converting coaching dollars into score gains most efficiently on the team — **$3.10 per 1,000 points**, well under the team average.",
}

export default function CostPerCoaching({ 
  coachingData, 
  summary,
  previewMode 
}: { 
  coachingData?: RoiAttributionResponse['coaching_efficiency']
  summary?: RoiAttributionResponse['coaching_efficiency_summary']
  previewMode?: boolean
}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiCostPerCoaching] ?? true)

  if (!previewMode && !visible) return null
  if (!previewMode && (!coachingData || !summary)) return null

  if (previewMode) {
    const badge = (
      <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
        {PREVIEW_DATA.badge}
      </div>
    )

    return (
      <Panel title={PREVIEW_DATA.title} subtitle={PREVIEW_DATA.subtitle} badge={badge}>
        <div className="grid gap-[10px]" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {PREVIEW_DATA.items.map((item) => (
            <div key={item.name} className="bg-surface-alt rounded-[10px] flex flex-col gap-[5px] px-[14px] py-[12px]">
              <div className="font-semibold text-secondary text-[11px]">{item.name}</div>
              <div className={`font-mono font-semibold text-[17px] ${itemCostClass[item.quality]}`}>{item.cost}</div>
              <div className="text-muted text-[10px] leading-[1.4]">per 1,000 points gained</div>
              <div className={`text-[10.5px] font-semibold ${itemGainClass[item.gainType]}`}>{item.gain}</div>
            </div>
          ))}
        </div>
        <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-[14px] px-[13px] py-[10px]">
          <span className="text-[13px] shrink-0 mt-px">{PREVIEW_DATA.insightEmoji}</span>
          <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
            {renderText(PREVIEW_DATA.insightText)}
          </p>
        </div>
      </Panel>
    )
  }

  // Displayed per 1,000 points rather than per single point — this system awards
  // ~75-100 points per scored interaction, so points_gained routinely reaches the
  // tens of thousands per month. A literal $/point ratio rounds to $0.00 at 2
  // decimals; per-1,000-points keeps the same real cost data in a readable range.
  const formatCost = (val: number | null, status: string) => {
    if (status === 'no_data' || val === null || val === undefined) return 'N/A'
    return `$${(val * 1000).toFixed(2)}`
  }

  const formatGain = (val: number | null, status: string) => {
    if (status === 'no_data' || val === null || val === undefined) return '0 pts'
    const sign = val > 0 ? '+' : ''
    return `${sign}${val} pts`
  }

  const items = coachingData!.map(row => {
    const isUp = row.points_gained !== null && row.points_gained > 0
    const isDown = row.points_gained !== null && row.points_gained < 0
    
    return {
      name: row.name,
      cost: formatCost(row.cost_per_point, row.status),
      quality: row.status === 'good' ? 'good' : (row.status === 'ok' ? 'ok' : 'bad'),
      gain: formatGain(row.points_gained, row.status),
      gainType: isUp ? 'up' : (isDown ? 'down' : 'flat') as 'up' | 'flat' | 'down'
    }
  })

  const formattedBadge = summary!.team_avg_cost_per_point
    ? `Team avg: $${(summary!.team_avg_cost_per_point * 1000).toFixed(2)}/1k pts`
    : 'Team avg: N/A'

  const badge = (
    <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
      {formattedBadge}
    </div>
  )

  return (
    <Panel title="Cost Per Coaching Moment vs. Performance Gain" subtitle="How efficiently is each coaching dollar converting to score improvement?" badge={badge}>
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: `repeat(${Math.max(1, items.length)}, 1fr)` }}>
        {items.map((item, index) => (
          <div key={index} className="bg-surface-alt rounded-[10px] flex flex-col gap-[5px] px-[14px] py-[12px]">
            <div className="font-semibold text-secondary text-[11px] truncate">{item.name}</div>
            <div className={`font-mono font-semibold text-[17px] ${itemCostClass[item.quality]}`}>
              {item.cost}
            </div>
            <div className="text-muted text-[10px] leading-[1.4]">per 1,000 points gained</div>
            <div className={`text-[10.5px] font-semibold ${itemGainClass[item.gainType]}`}>
              {item.gain}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-[14px] px-[13px] py-[10px]">
        <span className="text-[13px] shrink-0 mt-px">💡</span>
        <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
          {renderText(summary!.insight || 'Coaching efficiency insight is not yet available. Continue logging moments to see patterns.')}
        </p>
      </div>
    </Panel>
  )
}
