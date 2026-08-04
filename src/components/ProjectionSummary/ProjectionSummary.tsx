'use client'

import { useState } from 'react'
import styles from './ProjectionSummary.module.css'
import { renderText } from '@/utils/common'
import { PROJECTION_SUMMARY_DATA } from '@/lib/projection-summary-data'
import type { ProjectionStat, ProjectionSummaryData } from '@/types/projection-summary'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const PREVIEW_STATS: ProjectionStat[] = [
  { eyebrow: 'If current trajectory holds', value: '$52,000', highlight: false, sub: 'Projected net revenue impact is **$52K** for this period' },
  { eyebrow: 'If team score reaches target', value: '$71,000', highlight: true, sub: 'Estimated impact climbs to **$71K** once stalled issues resolve' },
  { eyebrow: 'Breakeven on platform', value: '3.2 wks', highlight: false, sub: 'Breakeven timeline is **3.2 weeks** for this period' },
  { eyebrow: 'Annual ROI projection', value: '14.3x', highlight: true, sub: 'Annual ROI projection is **14.3x** for this period' },
]

export default function ProjectionSummary({ previewMode }: { previewMode?: boolean } = {}) {
  const [data] = useState<ProjectionSummaryData>(PROJECTION_SUMMARY_DATA)
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiProjectionSummary] ?? true)
  if (!previewMode && !visible) return null

  const stats = previewMode ? PREVIEW_STATS : data.stats

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
        {previewMode ? '* Sample projection for preview purposes only.' : data.footnote}
      </div>
    </div>
  )
}
