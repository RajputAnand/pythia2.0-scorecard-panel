'use client'

import { useState } from 'react'
import Panel from '@/components/Panel/Panel'
import { PROGRESS_CHART_DATA } from '@/lib/progress-chart-data'

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

      {/* Chart */}
      <svg width="100%" viewBox="0 0 500 160" preserveAspectRatio="none">
        {/* Grid */}
        <line x1="0" y1="20" x2="500" y2="20" stroke="#F0EDE8" strokeWidth="1" />
        <line x1="0" y1="55" x2="500" y2="55" stroke="#F0EDE8" strokeWidth="1" />
        <line x1="0" y1="90" x2="500" y2="90" stroke="#F0EDE8" strokeWidth="1" />
        <line x1="0" y1="125" x2="500" y2="125" stroke="#F0EDE8" strokeWidth="1" />
        {/* Y labels */}
        <text x="0" y="24" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">95</text>
        <text x="0" y="59" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">85</text>
        <text x="0" y="94" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">75</text>
        <text x="0" y="129" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">65</text>
        {/* Series */}
        {[overall, hospitality, checkout].map((s) => (
          <g key={s.color}>
            <path d={s.path} fill="none" stroke={s.color} strokeWidth={s.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
            {s.dots.map((dot) => (
              <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r={dot.r} fill={s.color} stroke={dot.stroke} strokeWidth={dot.strokeWidth} />
            ))}
            {s.labels.map((lbl) => (
              <text key={`${lbl.x}-${lbl.y}`} x={lbl.x} y={lbl.y} fontSize="9" fill={s.color} fontFamily="DM Mono" fontWeight="500">{lbl.value}</text>
            ))}
          </g>
        ))}
        {/* Coaching marker */}
        <line x1={data.coachingMarker.x} y1="0" x2={data.coachingMarker.x} y2="160" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="3,3" />
        <text x={data.coachingMarker.x + 3} y="14" fontSize="8" fill="#B0A89E" fontFamily="DM Mono">{data.coachingMarker.label}</text>
        {/* Streak badge */}
        <rect x={data.streakBadge.x} y={data.streakBadge.y} width={data.streakBadge.width} height={data.streakBadge.height} rx="5" fill="#1D5C3A" opacity="0.12" />
        <text x={data.streakBadge.x + 6} y={data.streakBadge.y + 15} fontSize="9" fill="#1D5C3A" fontFamily="DM Sans" fontWeight="600">{data.streakBadge.text}</text>
      </svg>

      {/* X labels */}
      <div className="flex justify-between mt-[5px]">
        {data.xLabels.map(({ label, highlight }) => (
          <span
            key={label}
            className={`font-mono text-center text-[9.5px] ${highlight ? 'text-accent font-semibold' : 'text-muted'}`}
          >
            {label}
          </span>
        ))}
      </div>

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
