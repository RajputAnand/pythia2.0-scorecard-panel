'use client'

import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

interface InsightCard {
  id: string
  label: string
  icon: string
  iconVariant: 'red' | 'amber' | 'green' | 'blue'
  value: string
  valueVariant: 'red' | 'amber' | 'green' | 'blue'
  sub: string
  subBold: string
}

const CARDS: InsightCard[] = [
  {
    id: KPI_IDS.staffingCoverageGaps,
    label: 'Coverage Gaps',
    icon: '⚠️',
    iconVariant: 'red',
    value: '3',
    valueVariant: 'red',
    subBold: '3 peak windows',
    sub: ' have no high-scorer scheduled this week',
  },
  {
    id: KPI_IDS.staffingFatigueFlags,
    label: 'Fatigue Flags',
    icon: '😓',
    iconVariant: 'amber',
    value: '2',
    valueVariant: 'amber',
    subBold: 'Marcus & Devon',
    sub: ' show score drops after 8h shifts',
  },
  {
    id: KPI_IDS.staffingWeakPairings,
    label: 'Weak Pairings',
    icon: '👥',
    iconVariant: 'amber',
    value: '2',
    valueVariant: 'amber',
    subBold: 'Jamie scheduled alone',
    sub: ' on Thu & Fri with no top performer',
  },
  {
    id: KPI_IDS.staffingOptimizedShifts,
    label: 'Optimized Shifts',
    icon: '✅',
    iconVariant: 'green',
    value: '4',
    valueVariant: 'green',
    subBold: '4 of 7 days',
    sub: ' have strong coverage during peak hours',
  },
]

const iconBg: Record<string, string> = {
  red: 'bg-danger-light',
  amber: 'bg-amber-light',
  green: 'bg-accent-light',
  blue: 'bg-cobalt-light',
}

const valueColor: Record<string, string> = {
  red: 'text-danger',
  amber: 'text-amber',
  green: 'text-accent',
  blue: 'text-cobalt',
}

interface StaffingInsightStripProps {
  previewMode?: boolean
  /** Super Admin preview only — dims every card except the one being previewed, so it's obvious which card a given row controls. */
  highlightId?: string
}

export default function StaffingInsightStrip({ previewMode, highlightId }: StaffingInsightStripProps = {}) {
  const storeVisibility = useAdminConfigStore((s) => s.visibility)
  const visibility = previewMode ? {} : storeVisibility
  const cards = CARDS.filter((card) => visibility[card.id] ?? true)

  if (cards.length === 0) return null

  return (
    <div className="grid gap-[14px]" style={{ gridTemplateColumns: `repeat(${cards.length}, 1fr)` }}>
      {cards.map((card) => {
        const dimmed = highlightId != null && card.id !== highlightId
        return (
        <div
          key={card.label}
          className={`bg-surface border rounded-[13px] px-[18px] py-4 flex flex-col gap-2 transition-all duration-200 ${
            dimmed
              ? 'border-border opacity-35 blur-[1.5px] saturate-50'
              : highlightId != null
                ? 'border-accent ring-2 ring-accent/40 shadow-[0_4px_18px_rgba(0,0,0,.07)]'
                : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{card.label}</span>
            <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[12px] ${iconBg[card.iconVariant]}`}>
              {card.icon}
            </div>
          </div>
          <div className={`font-mono text-[26px] font-bold tracking-[-0.02em] leading-none ${valueColor[card.valueVariant]}`}>
            {card.value}
          </div>
          <div className="text-[11.5px] text-muted leading-[1.4]">
            <strong className="text-secondary font-medium">{card.subBold}</strong>
            {card.sub}
          </div>
        </div>
        )
      })}
    </div>
  )
}
