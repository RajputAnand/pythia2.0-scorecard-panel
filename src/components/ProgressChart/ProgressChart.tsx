'use client'

import { useState } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import { PROGRESS_CHART_DATA } from '@/lib/progress-chart-data'
import type { ProgressChartData } from '@/types/progress-chart'

const milestoneLabelClass: Record<string, string> = {
  reached: 'text-accent',
  next: 'text-amber',
}

export default function ProgressChart() {
  const [data] = useState<ProgressChartData>(PROGRESS_CHART_DATA)

  const { overall, hospitality, checkout } = data.series

  const badge = (
    <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      {data.badgeText}
    </span>
  )

  return (
    <Panel title={data.title} subtitle={data.subtitle} badge={badge}>
      {/* Legend */}
      <div className="flex gap-[14px] mb-3">
        <span className="flex items-center gap-[5px] text-secondary text-[11px]">
          <span className="rounded-[1px] w-[18px] h-[2px]" style={{ background: 'var(--color-accent)' }} />
          Overall
        </span>
        <span className="flex items-center gap-[5px] text-secondary text-[11px]">
          <span className="rounded-[1px] w-[18px] h-[2px]" style={{ background: 'var(--color-cobalt)' }} />
          Hospitality
        </span>
        <span className="flex items-center gap-[5px] text-secondary text-[11px]">
          <span className="rounded-[1px] w-[18px] h-[2px]" style={{ background: 'var(--color-amber)' }} />
          Checkout
        </span>
      </div>

      <LineChartSvg
        viewBox={data.viewBox}
        gridLines={data.gridLines}
        yLabels={data.yLabels}
        series={[overall, hospitality, checkout]}
        xLabels={data.xLabels}
        verticalMarker={data.coachingMarker}
        streakBadge={data.streakBadge}
      />

      {/* Milestones */}
      <div className="flex gap-2 mt-[14px]">
        {data.milestones.map((m) => (
          <div key={m.label} className="flex-1 flex flex-col bg-surface-alt rounded-[9px] gap-[3px] px-[12px] py-[10px]">
            <span className="text-[14px]">{m.icon}</span>
            <span className="uppercase tracking-[.07em] text-muted text-[10px]">{m.status}</span>
            <span className={`font-semibold text-[12px] ${milestoneLabelClass[m.variant]}`}>{m.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
