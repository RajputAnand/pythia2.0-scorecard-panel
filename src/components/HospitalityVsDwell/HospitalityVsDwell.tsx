'use client'

import { useState } from 'react'
import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import { renderText } from '@/utils/common'
import { HOSPITALITY_VS_DWELL_DATA } from '@/lib/hospitality-vs-dwell-data'
import type { HospitalityVsDwellData } from '@/types/hospitality-vs-dwell'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const PREVIEW_DATA: HospitalityVsDwellData = {
  ...HOSPITALITY_VS_DWELL_DATA,
  badge: '0.71 correlation',
  series: [
    {
      ...HOSPITALITY_VS_DWELL_DATA.series[0],
      labels: [
        { x: 15, y: 103, value: '71' },
        { x: 130, y: 95, value: '76' },
        { x: 245, y: 77, value: '81' },
        { x: 340, y: 60, value: '86' },
      ],
    },
    {
      ...HOSPITALITY_VS_DWELL_DATA.series[1],
      labels: [
        { x: 9, y: 128, value: '2.1m' },
        { x: 122, y: 128, value: '3.0m' },
        { x: 237, y: 128, value: '3.8m' },
        { x: 330, y: 128, value: '4.6m' },
        { x: 422, y: 128, value: '5.2m', opacity: 0.6 },
      ],
    },
  ],
  insightEmoji: '⏱',
  insightText: 'Higher **hospitality scores** track with longer **average dwell time** — engaged customers browse and buy more before leaving.',
}

export default function HospitalityVsDwell({ previewMode }: { previewMode?: boolean } = {}) {
  const [realData] = useState<HospitalityVsDwellData>(HOSPITALITY_VS_DWELL_DATA)
  const data = previewMode ? PREVIEW_DATA : realData
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiHospitalityVsDwell] ?? true)

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
