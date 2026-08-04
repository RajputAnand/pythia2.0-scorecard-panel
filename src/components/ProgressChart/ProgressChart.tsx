'use client'

import Panel from '@/components/shared/Panel/Panel'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import type { ChartDot, ChartLabel, ChartMinorTick, ChartXLabel, ChartYLabel, LineChartSeries } from '@/types/line-chart'
import type { ProgressOverTimeChartData, ProgressOverTimeData } from '@/types/overview'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const PLOT_LEFT = 28
const PLOT_RIGHT = 450
const PLOT_TOP = 20
const PLOT_BOTTOM = 130

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function xScale(i: number, n: number): number {
  return n <= 1 ? PLOT_LEFT : PLOT_LEFT + (i / (n - 1)) * (PLOT_RIGHT - PLOT_LEFT)
}

function monthLabels(weeks: ProgressOverTimeChartData[]): ChartXLabel[] {
  const months: string[] = []
  weeks.forEach((w) => {
    const month = new Date(w.week_start).toLocaleDateString('en-US', { month: 'short' })
    if (months[months.length - 1] !== month) months.push(month)
  })

  // The last week can straddle a month boundary (e.g. week_start in June, week_end in July) —
  // surface that trailing month too instead of only ever labeling by week_start.
  const lastWeek = weeks[weeks.length - 1]
  if (lastWeek) {
    const endMonth = new Date(lastWeek.week_end).toLocaleDateString('en-US', { month: 'short' })
    if (months[months.length - 1] !== endMonth) months.push(endMonth)
  }

  return months.map((label, i) => ({ label, highlight: i === months.length - 1 }))
}

function buildSeries(
  weeks: ProgressOverTimeChartData[],
  key: 'overall' | 'hospitality' | 'checkout_speed',
  color: string,
  strokeWidth: number,
  yScale: (value: number) => number,
): LineChartSeries {
  const points = weeks.map((w, i) => ({ x: xScale(i, weeks.length), y: yScale(w[key]) }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const dots: ChartDot[] = []
  const labels: ChartLabel[] = []
  const first = points[0]
  const last = points[points.length - 1]

  if (first) {
    dots.push({ cx: first.x, cy: first.y, r: 3.5 })
    labels.push({ x: first.x - 6, y: first.y - 8, value: weeks[0][key].toFixed(1) })
  }
  if (last && points.length > 1) {
    dots.push({ cx: last.x, cy: last.y, r: 4.5, fill: 'white', stroke: color, strokeWidth: 2 })
    labels.push({ x: last.x - 6, y: last.y - 8, value: weeks[weeks.length - 1][key].toFixed(1) })
  }

  return { path, color, strokeWidth, dots, labels }
}

export default function ProgressChart({ data, previewMode }: { data: ProgressOverTimeData; previewMode?: boolean }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.employeeProgressChart] ?? true)
  const { weeks, points_change_total } = data
  if ((!previewMode && !visible) || weeks.length === 0) return null

  const allValues = weeks.flatMap((w) => [w.overall, w.hospitality, w.checkout_speed])
  const rawMin = Math.min(...allValues)
  const rawMax = Math.max(...allValues)
  const domainMin = Math.floor(rawMin - 2)
  const domainMax = Math.ceil(rawMax + 2) === domainMin ? domainMin + 1 : Math.ceil(rawMax + 2)

  const yScale = (value: number) =>
    PLOT_BOTTOM - ((value - domainMin) / (domainMax - domainMin)) * (PLOT_BOTTOM - PLOT_TOP)

  const gridLines = [0, 1, 2, 3].map((i) => ({ y: PLOT_TOP + (i * (PLOT_BOTTOM - PLOT_TOP)) / 3 }))
  const yLabels: ChartYLabel[] = gridLines.map((gl) => ({
    x: 0,
    y: gl.y + 4,
    value: Math.round(domainMax - ((gl.y - PLOT_TOP) / (PLOT_BOTTOM - PLOT_TOP)) * (domainMax - domainMin)).toString(),
  }))

  const xLabels: ChartXLabel[] = monthLabels(weeks)
  const minorTicks: ChartMinorTick[] = weeks.map((_, i) => ({
    x: xScale(i, weeks.length),
    y1: PLOT_BOTTOM,
    y2: PLOT_BOTTOM + 5,
  }))

  const series = [
    buildSeries(weeks, 'overall', 'var(--color-accent)', 2.5, yScale),
    buildSeries(weeks, 'hospitality', 'var(--color-cobalt)', 2, yScale),
    buildSeries(weeks, 'checkout_speed', 'var(--color-amber)', 2, yScale),
  ]

  const sign = points_change_total > 0 ? '↑ +' : points_change_total < 0 ? '↓ ' : '→ '
  const badgeText = `${sign}${points_change_total} pts total`

  const badge = (
    <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
      {badgeText}
    </span>
  )

  const firstWeek = weeks[0]
  const lastWeek = weeks[weeks.length - 1]
  const subtitle = `Weekly score · ${formatShortDate(firstWeek.week_start)} – ${formatShortDate(lastWeek.week_end)}`

  return (
    <Panel title="My Progress Over Time" subtitle={subtitle} badge={badge}>
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
        viewBox="0 0 500 160"
        gridLines={gridLines}
        yLabels={yLabels}
        series={series}
        xLabels={xLabels}
        minorTicks={minorTicks}
      />
    </Panel>
  )
}
