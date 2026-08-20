'use client'

import { useSearchParams } from 'next/navigation'
import styles from './ProjectionSummary.module.css'
import { renderText } from '@/utils/common'
import type { ProjectionStat } from '@/types/projection-summary'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { RoiAttributionResponse } from '@/types/owner-roi'
import { resolveRoiView } from '@/utils/roi-view'

import { PROJECTION_SUMMARY_DATA } from '@/lib/projection-summary-data'
import type { ProjectionSummaryData } from '@/types/projection-summary'

const PREVIEW_STATS: ProjectionStat[] = [
  { eyebrow: 'If current trajectory holds', value: '$52,000', highlight: false, sub: 'Projected net revenue impact is **$52K** for this period' },
  { eyebrow: 'If team score reaches target', value: '$71,000', highlight: true, sub: 'Estimated impact climbs to **$71K** once stalled issues resolve' },
  { eyebrow: 'Breakeven on platform', value: '3.2 wks', highlight: false, sub: 'Breakeven timeline is **3.2 weeks** for this period' },
  { eyebrow: 'Annual ROI projection', value: '14.3x', highlight: true, sub: 'Annual ROI projection is **14.3x** for this period' },
]

export default function ProjectionSummary({ data, previewMode }: { data?: RoiAttributionResponse['projection_summary']; previewMode?: boolean }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiProjectionSummary] ?? true)
  const searchParams = useSearchParams()
  const view = resolveRoiView(searchParams.get('view'))

  if (!previewMode && !visible) return null
  if (!previewMode && !data) return null
  // This panel is entirely forward-looking (trajectory, breakeven, annual ROI) — the
  // backend used to zero these fields out for 'actual' view; now that the frontend
  // always fetches the full 'both' payload and filters client-side, the equivalent is
  // hiding the whole panel rather than showing forward-looking numbers under "Actuals Only".
  if (!previewMode && view === 'actual') return null

  const stats: ProjectionStat[] = previewMode ? PREVIEW_STATS : [
    { 
      eyebrow: 'If current trajectory holds', 
      value: data!.trajectory_next_period_amount != null ? `$${data!.trajectory_next_period_amount.toLocaleString('en-US')}` : 'N/A', 
      highlight: false, 
      sub: data!.trajectory_next_period_amount != null 
        ? `Projected net revenue impact is **$${data!.trajectory_next_period_amount.toLocaleString('en-US')}** for this period` 
        : 'Not enough data yet to project trajectory.' 
    },
    { 
      eyebrow: 'Breakeven on platform', 
      value: data!.breakeven_days != null ? `${data!.breakeven_days} days` : 'N/A', 
      highlight: false, 
      sub: data!.breakeven_days != null 
        ? `Breakeven timeline is **${data!.breakeven_days} days**` 
        : 'Not enough data yet to calculate breakeven.' 
    },
    { 
      eyebrow: 'Annual ROI projection', 
      value: data!.annual_roi_multiplier != null ? `${data!.annual_roi_multiplier.toFixed(1)}x` : 'N/A', 
      highlight: true, 
      sub: data!.annual_roi_multiplier != null 
        ? `Annual ROI projection is **${data!.annual_roi_multiplier.toFixed(1)}x**` 
        : 'Not enough data yet for annual projection.' 
    },
  ]

  return (
    <div
      className={`${styles.projSummary} relative rounded-2xl overflow-hidden grid gap-6`}
      style={{
        background: 'var(--color-cobalt)',
        padding: '22px 28px',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      }}
    >
      {stats.map((stat) => (
        <div key={stat.eyebrow} className="flex flex-col gap-[5px]">
          <div
            className="font-medium uppercase text-[9.5px]"
            style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '.1em' }}
          >
            {stat.eyebrow}
          </div>
          <div
            className="font-mono font-medium text-[26px] leading-none"
            style={{ color: stat.highlight ? '#A8DFCA' : 'white' }}
          >
            {stat.value}
          </div>
          <div
            className="text-[11px] leading-[1.4] [&_strong]:text-white/75"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {renderText(stat.sub)}
          </div>
        </div>
      ))}
      <div
        className="text-[10.5px] italic mt-[10px]"
        style={{ color: 'rgba(255,255,255,0.3)', gridColumn: `span ${stats.length}` }}
      >
        {previewMode ? '* Sample projection for preview purposes only.' : data!.assumption_note}
      </div>
    </div>
  )
}
