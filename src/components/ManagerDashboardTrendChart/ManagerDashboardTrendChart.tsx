'use client'

import Panel from '@/components/shared/Panel/Panel'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import type { ManagerDashboardTrendWeek } from '@/types/manager-dashboard'
import type { ChartDot, ChartLabel, ChartXLabel, ChartYLabel, LineChartSeries } from '@/types/line-chart'
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

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-[5px] text-muted">
      <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: color }} />
      {label}
    </span>
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
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.managerTrendChart] ?? true)
  if (!previewMode && !visible) return null
  if (!weeks || weeks.length === 0) return <Skeleton />

  const gridLines = [0, 1, 2, 3, 4].map((i) => ({ y: PLOT_TOP + (i * (PLOT_BOTTOM - PLOT_TOP)) / 4 }))
  const yLabels: ChartYLabel[] = gridLines.map((gl, i) => ({ x: 0, y: gl.y + 4, value: `${100 - i * 25}` }))

  const xLabels: ChartXLabel[] = weeks.map((w, i) => ({
    label: new Date(w.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    highlight: i === weeks.length - 1,
  }))

  const series = [
    buildSeries(weeks, 'thanked_rate', 'var(--color-accent)'),
    buildSeries(weeks, 'value_prop_rate', 'var(--color-cobalt)'),
    buildSeries(weeks, 'greeted_rate', 'var(--color-amber)'),
  ]

  return (
    <Panel
      title="Recognition Trend"
      subtitle={`Weekly rates over the last ${weeks.length} weeks`}
      badge={
        <div className="flex items-center gap-3 text-[10.5px] shrink-0">
          <LegendDot color="var(--color-accent)" label="Thank You" />
          <LegendDot color="var(--color-cobalt)" label="Value Prop." />
          <LegendDot color="var(--color-amber)" label="Greeted" />
        </div>
      }
    >
      <LineChartSvg viewBox="0 0 500 160" gridLines={gridLines} yLabels={yLabels} series={series} xLabels={xLabels} />
    </Panel>
  )
}
