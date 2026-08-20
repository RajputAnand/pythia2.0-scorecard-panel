'use client'

import LineChartSvg from '@/components/shared/LineChartSvg/LineChartSvg'
import { renderText } from '@/utils/common'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { RoiChartData, RoiAttributionParams } from '@/types/owner-roi'
import { mapRoiChartData } from '@/utils/roi-chart-mapper'

import { CHECKOUT_SPEED_DATA } from '@/lib/checkout-speed-data'
import type { CheckoutSpeedData } from '@/types/checkout-speed'

const PREVIEW_DATA: CheckoutSpeedData = {
  ...CHECKOUT_SPEED_DATA,
  series: [
    {
      ...CHECKOUT_SPEED_DATA.series[0],
      labels: [
        { x: 14, y: 33, value: '52s' },
        { x: 129, y: 40, value: '46s' },
        { x: 244, y: 55, value: '39s' },
        { x: 339, y: 67, value: '34s' },
      ],
    },
    {
      ...CHECKOUT_SPEED_DATA.series[1],
      labels: [
        { x: 12, y: 100, value: '58/hr' },
        { x: 123, y: 100, value: '64/hr' },
        { x: 237, y: 100, value: '71/hr' },
        { x: 330, y: 100, value: '79/hr' },
        { x: 420, y: 100, value: '86/hr', opacity: 0.6 },
      ],
    },
  ],
  insights: [
    { emoji: '⚡', text: 'Checkout speed improved **34% faster** this period, cutting the average transaction from 52s to 34s.', variant: 'default' },
    { emoji: '💰', text: 'Estimated captured revenue from checkout speed improvements is **$6,200** this period.', variant: 'blue' },
  ],
}

export default function CheckoutSpeed({ data, previewMode, view = 'both' }: { data?: RoiChartData; previewMode?: boolean; view?: RoiAttributionParams['view'] }) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiCheckoutSpeed] ?? true)

  if (!previewMode && !visible) return null
  if (!previewMode && !data) return null

  const chartData = previewMode ? PREVIEW_DATA : mapRoiChartData(
    data!,
    'Checkout Speed vs. Customers Served Per Hour',
    'Monthly average · Assigned Stores',
    '#C47F18',
    '#1E4D7A',
    '⚡',
    view
  )

  const insights = previewMode ? PREVIEW_DATA.insights : [
    { emoji: (chartData as any).insightEmoji, text: (chartData as any).insightText, variant: 'default' }
  ]

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">{chartData.title}</div>
          <div className="text-muted text-[11px] mt-0.5">{chartData.subtitle}</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-accent-light text-accent text-[10px] px-[8px] py-[3px]">
          {chartData.badge}
        </div>
      </div>
      <div className="px-5 py-[18px]">
        <div className="grid grid-cols-2 gap-6 items-start">
          <div>
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
            <LineChartSvg
              viewBox={chartData.viewBox}
              gridLines={chartData.gridLines}
              yLabels={chartData.yLabels}
              series={chartData.series}
              xLabels={chartData.xLabels}
              verticalMarker={chartData.verticalMarker}
            />
          </div>
          <div className="flex flex-col gap-3 pt-7">
            {insights.map((insight, i) =>
              insight.variant === 'blue' ? (
                <div key={insight.emoji} className={`flex items-start gap-2 rounded-[9px] px-[13px] py-[10px]${i > 0 ? ' mt-3' : ''}`} style={{ background: '#E6EEF7' }}>
                  <span className="text-[13px] shrink-0 mt-px">{insight.emoji}</span>
                  <p className="text-[12px] leading-[1.5] [&_strong]:font-semibold" style={{ color: '#1E4D7A' }}>
                    {renderText(insight.text)}
                  </p>
                </div>
              ) : (
                <div key={insight.emoji} className={`flex items-start gap-2 bg-surface-alt rounded-[9px] px-[13px] py-[10px]${i > 0 ? ' mt-3' : ''}`}>
                  <span className="text-[13px] shrink-0 mt-px">{insight.emoji}</span>
                  <p className="text-secondary text-[12px] leading-[1.5] [&_strong]:font-semibold [&_strong]:text-primary">
                    {renderText(insight.text)}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
