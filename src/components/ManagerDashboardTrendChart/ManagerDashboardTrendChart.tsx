'use client'

import { useState } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import type { ManagerDashboardTrendWeek } from '@/types/manager-dashboard'
import type { ChartDot, ChartHoverPointer, ChartLabel, ChartXLabel, ChartYLabel, LineChartSeries } from '@/types/line-chart'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

interface Props {
  weeks: ManagerDashboardTrendWeek[] | null
  previewMode?: boolean
}

const PLOT_LEFT = 30
const PLOT_RIGHT = 470
const PLOT_TOP = 16
const PLOT_BOTTOM = 130

function xScale(i: number, n: number): number {
  return n <= 1 ? PLOT_LEFT : PLOT_LEFT + (i / (n - 1)) * (PLOT_RIGHT - PLOT_LEFT)
}

// Rates are bounded 0-100 by definition, so the y-axis domain is fixed
// rather than derived from the data (unlike ProgressChart's shared-domain
// approach, which needs derivation because raw scores aren't bounded).
function yScale(value: number): number {
  return PLOT_BOTTOM - (Math.max(0, Math.min(100, value)) / 100) * (PLOT_BOTTOM - PLOT_TOP)
}

type RateKey = 'thanked_rate' | 'value_prop_rate' | 'greeted_rate'

function buildSeries(weeks: ManagerDashboardTrendWeek[], key: RateKey, color: string): LineChartSeries {
  const points = weeks.map((w, i) => ({ x: xScale(i, weeks.length), y: yScale(w[key]) }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const dots: ChartDot[] = points.map((p) => ({ cx: p.x, cy: p.y, r: 3 }))

  // Direct label only on the most recent point per series — one number per
  // line, not one per point, to keep 3 overlapping series readable.
  const last = points[points.length - 1]
  const labels: ChartLabel[] = last
    ? [{ x: last.x - 10, y: last.y - 8, value: `${weeks[weeks.length - 1][key]}%` }]
    : []

  return { path, color, strokeWidth: 2.25, dots, labels }
}

function LegendDot({ color, label, active, onClick }: { color: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <div className='flex'>
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={`flex items-center gap-[5px] rounded-sm text-gray-800 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active ? '' : 'opacity-40'} cursor-pointer`}
      >
        <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: color }} />
        {label}
      </button>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden animate-pulse">
      <div className="flex items-center justify-between px-5 py-[15px] border-b border-border">
        <div className="h-4 w-40 rounded bg-border" />
        <div className="h-3 w-48 rounded bg-border" />
      </div>
      <div className="h-[180px] mx-5 my-[18px] rounded bg-border" />
    </div>
  )
}

export default function ManagerDashboardTrendChart({ weeks, previewMode }: Props) {
  const [visibleSeries, setVisibleSeries] = useState<Record<RateKey, boolean>>({
    thanked_rate: true,
    value_prop_rate: true,
    greeted_rate: true,
  })
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverPointer, setHoverPointer] = useState<ChartHoverPointer | null>(null)
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.managerTrendChart] ?? true)
  if (!previewMode && !visible) return null
  if (!weeks || weeks.length === 0) return <Skeleton />

  const gridLines = [0, 1, 2, 3, 4].map((i) => ({ y: PLOT_TOP + (i * (PLOT_BOTTOM - PLOT_TOP)) / 4 }))
  const yLabels: ChartYLabel[] = gridLines.map((gl, i) => ({ x: 0, y: gl.y + 4, value: `${100 - i * 25}` }))

  const xLabels: ChartXLabel[] = weeks.map((w, i) => ({
    label: new Date(w.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    highlight: i === weeks.length - 1,
  }))

  const series = ([
    ['thanked_rate', 'var(--color-accent)'],
    ['value_prop_rate', 'var(--color-cobalt)'],
    ['greeted_rate', 'var(--color-amber)'],
  ] as const)
    .filter(([key]) => visibleSeries[key])
    .map(([key, color]) => buildSeries(weeks, key, color))
  const hoverXPositions = weeks.map((_, i) => xScale(i, weeks.length))

  function toggleSeries(key: RateKey) {
    setVisibleSeries((current) => ({ ...current, [key]: !current[key] }))
  }

  return (
    <Panel
      title="Recognition Trend"
      subtitle={`Weekly rates over the last ${weeks.length} weeks`}
      badge={
        <div className="flex items-center gap-3 text-[13px] shrink-0">
          <LegendDot color="var(--color-accent)" label="Thank You" active={visibleSeries.thanked_rate} onClick={() => toggleSeries('thanked_rate')} />
          <LegendDot color="var(--color-cobalt)" label="Value Prop." active={visibleSeries.value_prop_rate} onClick={() => toggleSeries('value_prop_rate')} />
          <LegendDot color="var(--color-amber)" label="Greeted" active={visibleSeries.greeted_rate} onClick={() => toggleSeries('greeted_rate')} />
        </div>
      }
    >
      <div className="relative">
        {hoverIndex !== null && hoverPointer !== null && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface px-3 py-2 shadow-md"
            style={{
              left: `${hoverPointer.x}px`,
              top: `${hoverPointer.y}px`,
              transform: `translate(${hoverPointer.x / hoverPointer.width > 0.7 ? 'calc(-100% - 12px)' : '12px'}, ${hoverPointer.y / hoverPointer.height > 0.65 ? 'calc(-100% - 12px)' : '12px'})`,
            }}
          >
            <div className="mb-1 text-[10px] font-medium text-secondary">
              {new Date(weeks[hoverIndex].week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex flex-col gap-1 text-[10.5px]">
              {visibleSeries.thanked_rate && <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-accent" />Thank You</span><strong className="font-mono text-primary">{weeks[hoverIndex].thanked_rate}%</strong></div>}
              {visibleSeries.value_prop_rate && <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-cobalt" />Value Prop.</span><strong className="font-mono text-primary">{weeks[hoverIndex].value_prop_rate}%</strong></div>}
              {visibleSeries.greeted_rate && <div className="flex items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-secondary"><span className="h-1.5 w-1.5 rounded-full bg-amber" />Greeted</span><strong className="font-mono text-primary">{weeks[hoverIndex].greeted_rate}%</strong></div>}
            </div>
          </div>
        )}
        <LineChartSvg
          viewBox="0 0 500 160"
          gridLines={gridLines}
          yLabels={yLabels}
          series={series}
          xLabels={xLabels}
          hoverIndex={hoverIndex}
          hoverXPositions={hoverXPositions}
          onHoverIndexChange={setHoverIndex}
          onHoverPointerChange={setHoverPointer}
        />
      </div>
    </Panel>
  )
}
