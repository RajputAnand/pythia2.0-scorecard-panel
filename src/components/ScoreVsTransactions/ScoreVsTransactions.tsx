'use client'

import { useState } from 'react'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import { renderText } from '@/utils/common'
import { SCORE_VS_TRANSACTIONS_DATA } from '@/lib/score-vs-transactions-data'
import type { ScoreVsTransactionsData } from '@/types/score-vs-transactions'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

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

export default function ScoreVsTransactions({ previewMode }: { previewMode?: boolean } = {}) {
  const [realData] = useState<ScoreVsTransactionsData>(SCORE_VS_TRANSACTIONS_DATA)
  const data = previewMode ? PREVIEW_DATA : realData
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiScoreVsTransactions] ?? true)

  if (!previewMode && !visible) return null

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">{data.title}</div>
          <div className="text-muted text-[11px] mt-0.5">{data.subtitle}</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
          {data.badge}
        </div>
      </div>
      <div className="px-5 py-[18px]">
        <div className="flex gap-[14px] mb-[10px]">
          {data.legend.map((item) => (
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
        <LineChartSvg
          viewBox={data.viewBox}
          gridLines={data.gridLines}
          yLabels={data.yLabels}
          series={data.series}
          xLabels={data.xLabels}
          verticalMarker={data.verticalMarker}
        />
        <div className="flex items-start gap-2 bg-surface-alt rounded-[9px] mt-3 px-[13px] py-[10px]">
          <span className="text-[13px] shrink-0 mt-px">{data.insightEmoji}</span>
          <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
            {renderText(data.insightText)}
          </p>
        </div>
      </div>
    </div>
  )
}
