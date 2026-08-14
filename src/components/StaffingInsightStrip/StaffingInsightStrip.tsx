'use client'

import { useAdminConfigStore } from '@/store/adminConfigStore'
import { useStaffingStore } from '@/store/staffingStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { ApiInsights } from '@/types/staff'

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

/** Falls back to representative placeholder values when `data` is null — covers
 * both the loading state (before the first fetch resolves) and the Super Admin
 * KPI-visibility panel's hover preview, which renders this component with no
 * `data` prop at all. */
function buildCards(data: ApiInsights | null | undefined): InsightCard[] {
  return [
    {
      id: KPI_IDS.staffingCoverageGaps,
      label: 'Coverage Gaps',
      icon: '⚠️',
      iconVariant: 'red',
      value: String(data?.coverage_gaps ?? 3),
      valueVariant: 'red',
      subBold: data?.coverage_gaps_sub_bold ?? '3 peak windows',
      sub: data?.coverage_gaps_sub ?? ' have no high-scorer scheduled this week',
    },
    {
      id: KPI_IDS.staffingFatigueFlags,
      label: 'Fatigue Flags',
      icon: '😓',
      iconVariant: 'amber',
      value: String(data?.fatigue_flags ?? 2),
      valueVariant: 'amber',
      subBold: data?.fatigue_flags_sub_bold ?? 'Marcus & Devon',
      sub: data?.fatigue_flags_sub ?? ' show score drops after 8h shifts',
    },
    {
      id: KPI_IDS.staffingWeakPairings,
      label: 'Weak Pairings',
      icon: '👥',
      iconVariant: 'amber',
      value: String(data?.weak_pairings ?? 2),
      valueVariant: 'amber',
      subBold: data?.weak_pairings_sub_bold ?? 'Jamie scheduled alone',
      sub: data?.weak_pairings_sub ?? ' on Thu & Fri with no top performer',
    },
    {
      id: KPI_IDS.staffingOptimizedShifts,
      label: 'Optimized Shifts',
      icon: '✅',
      iconVariant: 'green',
      value: String(data?.optimized_shifts ?? 4),
      valueVariant: 'green',
      subBold: data?.optimized_shifts_sub_bold ?? '4 of 7 days',
      sub: data?.optimized_shifts_sub ?? ' have strong coverage during peak hours',
    },
  ]
}

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
  data?: ApiInsights | null
  previewMode?: boolean
  /** Super Admin preview only — dims every card except the one being previewed, so it's obvious which card a given row controls. */
  highlightId?: string
}

export default function StaffingInsightStrip({ data, previewMode, highlightId }: StaffingInsightStripProps = {}) {
  const storeVisibility = useAdminConfigStore((s) => s.visibility)
  const visibility = previewMode ? {} : storeVisibility

  // Rendered at the page level as a sibling of StaffingPageContent (which owns the
  // Zustand-based week/schedule state — see AGENTS.md's Zustand convention for state
  // shared across unrelated components). Prefer the live store value once
  // StaffingPageContent hydrates/refetches it, falling back to the server-fetched
  // `data` prop for the very first paint so there's no loading flash. Bypassed
  // entirely in previewMode so the Super Admin hover preview never reads real page state.
  const liveInsights = useStaffingStore((s) => s.insights)
  const effectiveData = previewMode ? undefined : liveInsights ?? data

  const cards = buildCards(effectiveData).filter((card) => visibility[card.id] ?? true)

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
