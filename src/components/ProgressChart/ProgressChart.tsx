'use client'

import { useState } from 'react'
import Panel from '@/components/shared/Panel/Panel'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import type {
  ChartDot,
  ChartHoverPointer,
  ChartLabel,
  ChartMinorTick,
  ChartXLabel,
  ChartYLabel,
  LineChartSeries,
} from '@/types/line-chart'
import type { ProgressOverTimeChartData, ProgressOverTimeData } from '@/types/overview'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const PLOT_LEFT = 30
const PLOT_RIGHT = 455
const PLOT_TOP = 16
const PLOT_BOTTOM = 130

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function xScale(i: number, n: number): number {
  return n <= 1 ? PLOT_LEFT : PLOT_LEFT + (i / (n - 1)) * (PLOT_RIGHT - PLOT_LEFT)
}

type SeriesKey = 'overall' | 'hospitality' | 'checkout_speed'

function buildSeries(
  weeks: ProgressOverTimeChartData[],
  key: SeriesKey,
  color: string,
  strokeWidth: number,
  yScale: (value: number) => number,
): LineChartSeries {
  const points = weeks.map((w, i) => ({ x: xScale(i, weeks.length), y: yScale(w[key]) }))
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  const dots: ChartDot[] = points.map((p, i) =>
    i === points.length - 1
      ? { cx: p.x, cy: p.y, r: 4.5, fill: 'white', stroke: color, strokeWidth: 2 }
      : { cx: p.x, cy: p.y, r: 3 },
  )

  // Trailing label to the right of the most recent point per series.
  // Placing it to the right of the dot with halo ensures the trend lines never cross through numbers.
  // Omitting the first point's label eliminates the heavy text collision on the left.
  const last = points[points.length - 1]
  const labels: ChartLabel[] = last
    ? [{ x: last.x + 8, y: last.y + 3, value: weeks[weeks.length - 1][key].toFixed(1) }]
    : []

  return { path, color, strokeWidth, dots, labels }
}

function LegendToggle({
  color,
  label,
  active,
  onClick,
}: {
  color: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex items-center gap-[6px] text-secondary text-[11px] transition-opacity cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        active ? 'opacity-100 font-medium' : 'opacity-40'
      }`}
    >
      <span className="rounded-[1px] w-[16px] h-[3px] shrink-0" style={{ background: color }} />
      {label}
    </button>
  )
}

export default function ProgressChart({ data, previewMode }: { data: ProgressOverTimeData; previewMode?: boolean }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.employeeProgressChart] ?? true)
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({
    overall: true,
    hospitality: true,
    checkout_speed: true,
  })
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverPointer, setHoverPointer] = useState<ChartHoverPointer | null>(null)

  const { weeks, points_change_total } = data
  if ((!previewMode && !visible) || weeks.length === 0) return null

  function toggleSeries(key: SeriesKey) {
    setVisibleSeries((current) => {
      const next = { ...current, [key]: !current[key] }
      if (!next.overall && !next.hospitality && !next.checkout_speed) {
        return current
      }
      return next
    })
  }

  const activeKeys = (['overall', 'hospitality', 'checkout_speed'] as const).filter((k) => visibleSeries[k])
  const keysForDomain = activeKeys.length > 0 ? activeKeys : (['overall', 'hospitality', 'checkout_speed'] as const)
  const allValues = weeks.flatMap((w) => keysForDomain.map((k) => w[k]))
  const rawMin = Math.min(...allValues)
  const rawMax = Math.max(...allValues)
  const domainMin = Math.max(0, Math.floor(rawMin - 2))
  const domainMax = Math.ceil(rawMax + 2) === domainMin ? domainMin + 1 : Math.ceil(rawMax + 2)

  const yScale = (value: number) =>
    PLOT_BOTTOM - ((value - domainMin) / (domainMax - domainMin)) * (PLOT_BOTTOM - PLOT_TOP)

  const gridLines = [0, 1, 2, 3].map((i) => ({ y: PLOT_TOP + (i * (PLOT_BOTTOM - PLOT_TOP)) / 3 }))
  const yLabels: ChartYLabel[] = gridLines.map((gl) => ({
    x: 0,
    y: gl.y + 4,
    value: Math.round(domainMax - ((gl.y - PLOT_TOP) / (PLOT_BOTTOM - PLOT_TOP)) * (domainMax - domainMin)).toString(),
  }))

  const xLabels: ChartXLabel[] = weeks.map((w, i) => ({
    label: formatShortDate(w.week_start),
    highlight: i === weeks.length - 1,
  }))
  const hoverXPositions = weeks.map((_, i) => xScale(i, weeks.length))

  const minorTicks: ChartMinorTick[] = weeks.map((_, i) => ({
    x: xScale(i, weeks.length),
    y1: PLOT_BOTTOM,
    y2: PLOT_BOTTOM + 5,
  }))

  const seriesDefinitions: [SeriesKey, string, number][] = [
    ['overall', 'var(--color-accent)', 2.5],
    ['hospitality', 'var(--color-cobalt)', 2],
    ['checkout_speed', 'var(--color-amber)', 2],
  ]

  const series = seriesDefinitions
    .filter(([key]) => visibleSeries[key])
    .map(([key, color, strokeWidth]) => buildSeries(weeks, key, color, strokeWidth, yScale))

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
      {/* Legend with interactive toggles */}
      <div className="flex gap-[16px] mb-3 select-none">
        <LegendToggle
          color="var(--color-accent)"
          label="Overall"
          active={visibleSeries.overall}
          onClick={() => toggleSeries('overall')}
        />
        <LegendToggle
          color="var(--color-cobalt)"
          label="Hospitality"
          active={visibleSeries.hospitality}
          onClick={() => toggleSeries('hospitality')}
        />
        <LegendToggle
          color="var(--color-amber)"
          label="Checkout"
          active={visibleSeries.checkout_speed}
          onClick={() => toggleSeries('checkout_speed')}
        />
      </div>

      <div className="relative">
        {hoverIndex !== null && hoverPointer !== null && weeks[hoverIndex] && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-surface px-3 py-2 shadow-md"
            style={{
              left: `${hoverPointer.x}px`,
              top: `${hoverPointer.y}px`,
              transform: `translate(${hoverPointer.x / hoverPointer.width > 0.7 ? 'calc(-100% - 12px)' : '12px'}, ${hoverPointer.y / hoverPointer.height > 0.65 ? 'calc(-100% - 12px)' : '12px'})`,
            }}
          >
            <div className="mb-1 text-[10px] font-medium text-secondary">
              {formatShortDate(weeks[hoverIndex].week_start)} – {formatShortDate(weeks[hoverIndex].week_end)}
            </div>
            <div className="flex flex-col gap-1 text-[10.5px]">
              {visibleSeries.overall && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Overall
                  </span>
                  <strong className="font-mono text-primary">{weeks[hoverIndex].overall.toFixed(1)}</strong>
                </div>
              )}
              {visibleSeries.hospitality && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-cobalt" />
                    Hospitality
                  </span>
                  <strong className="font-mono text-primary">{weeks[hoverIndex].hospitality.toFixed(1)}</strong>
                </div>
              )}
              {visibleSeries.checkout_speed && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                    Checkout
                  </span>
                  <strong className="font-mono text-primary">{weeks[hoverIndex].checkout_speed.toFixed(1)}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        <LineChartSvg
          viewBox="0 0 500 160"
          gridLines={gridLines}
          yLabels={yLabels}
          series={series}
          xLabels={xLabels}
          minorTicks={minorTicks}
          hoverIndex={hoverIndex}
          hoverXPositions={hoverXPositions}
          verticalLines="highlighted"
          onHoverIndexChange={setHoverIndex}
          onHoverPointerChange={setHoverPointer}
        />
      </div>
    </Panel>
  )
}
