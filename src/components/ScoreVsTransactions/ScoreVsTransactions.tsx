'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import { renderText } from '@/utils/common'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { RoiChartData } from '@/types/owner-roi'
import type { ChartHoverPointer } from '@/types/line-chart'
import { mapRoiChartData } from '@/utils/roi-chart-mapper'
import { resolveRoiView } from '@/utils/roi-view'

import { SCORE_VS_TRANSACTIONS_DATA } from '@/lib/score-vs-transactions-data'
import type { ScoreVsTransactionsData } from '@/types/score-vs-transactions'

// Same chart geometry as SCORE_VS_TRANSACTIONS_DATA — just realistic labels
// instead of the live "0"/"N/A" placeholders, for the Super Admin preview only.
const PREVIEW_DATA: ScoreVsTransactionsData = {
  ...SCORE_VS_TRANSACTIONS_DATA,
  badge: '0.82 correlation',
  yLabels: [
    { x: 0, y: 24, value: '100' },
    { x: 0, y: 54, value: '75' },
    { x: 0, y: 84, value: '50' },
    { x: 0, y: 114, value: '25' },
  ],
  series: [
    {
      ...SCORE_VS_TRANSACTIONS_DATA.series[0],
      labels: [
        { x: 15, y: 100, value: '68' },
        { x: 130, y: 90, value: '74' },
        { x: 245, y: 75, value: '79' },
        { x: 340, y: 57, value: '84' },
        { x: 435, y: 43, value: '88', opacity: 0.6 },
      ],
    },
    {
      ...SCORE_VS_TRANSACTIONS_DATA.series[1],
      labels: [
        { x: 15, y: 130, value: '1.4k' },
        { x: 118, y: 130, value: '1.6k' },
        { x: 232, y: 130, value: '1.8k' },
        { x: 327, y: 130, value: '2.0k' },
        { x: 420, y: 130, value: '2.2k', opacity: 0.6 },
      ],
    },
  ],
  insightEmoji: '📈',
  insightText: 'Team score and monthly transactions are **strongly correlated (0.82)** — as coaching lifts hospitality and speed, transaction volume follows.',
}

export default function ScoreVsTransactions({ data, previewMode }: { data?: RoiChartData; previewMode?: boolean }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [hoverPointer, setHoverPointer] = useState<ChartHoverPointer | null>(null)
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiScoreVsTransactions] ?? true)
  const searchParams = useSearchParams()
  const view = resolveRoiView(searchParams.get('view'))

  if (!previewMode && !visible) return null
  if (!previewMode && !data) return null

  const chartData = previewMode ? PREVIEW_DATA : mapRoiChartData(
    data!,
    'Team Score vs. Transaction Volume',
    'Monthly · Assigned Stores',
    '#1D5C3A',
    '#1E4D7A',
    '📈',
    view
  )
  const hoverXPositions = [20, 135, 250, 345, 440].slice(0, chartData.xLabels.length)
  const hoveredValues = hoverIndex === null ? [] : chartData.series.flatMap((item, i) => {
    if (!item.dots.length || hoverXPositions[hoverIndex] === undefined) return []
    const dotIndex = item.dots.reduce((nearest, dot, index) =>
      Math.abs(dot.cx - hoverXPositions[hoverIndex]) < Math.abs(item.dots[nearest].cx - hoverXPositions[hoverIndex]) ? index : nearest, 0)
    if (Math.abs(item.dots[dotIndex].cx - hoverXPositions[hoverIndex]) >= 1) return []
    return [{ label: chartData.legend[i]?.label ?? '', color: item.color, value: item.labels[dotIndex]?.value ?? '—' }]
  })

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">{chartData.title}</div>
          <div className="text-gray-800 text-[11px] mt-0.5">{chartData.subtitle}</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
          {chartData.badge}
        </div>
      </div>
      <div className="px-5 py-[18px]">
        <div className="flex gap-[14px] mb-[10px]">
          {chartData.legend.map((item) => (
            <div key={item.label} className="flex items-center gap-[5px] text-secondary text-[11px]">
              <div
                className="w-5 h-0.5 rounded-[1px]"
                style={{
                  background: item.dashed
                    ? `repeating-linear-gradient(90deg,${item.color} 0,${item.color} 4px,transparent 4px,transparent 8px)`
                    : item.color,
                }}
              />
              {item.label}
            </div>
          ))}
        </div>
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
              <div className="mb-1 text-[10px] font-medium text-secondary">{chartData.xLabels[hoverIndex]?.label}</div>
              <div className="flex flex-col gap-1 text-[10.5px]">
                {hoveredValues.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5 text-secondary"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
                    <strong className="font-mono text-primary">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          <LineChartSvg
            viewBox={chartData.viewBox}
            gridLines={chartData.gridLines}
            yLabels={chartData.yLabels}
            series={chartData.series}
            xLabels={chartData.xLabels}
            verticalMarker={chartData.verticalMarker}
            hoverIndex={hoverIndex}
            hoverXPositions={hoverXPositions}
            onHoverIndexChange={setHoverIndex}
            onHoverPointerChange={setHoverPointer}
          />
        </div>
        <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-3 px-[13px] py-[10px]">
          <span className="text-[13px] shrink-0 mt-px">{chartData.insightEmoji}</span>
          <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
            {renderText(chartData.insightText)}
          </p>
        </div>
      </div>
    </div>
  )
}
