'use client'

import type React from 'react'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

type SegmentVariant = 'growing' | 'shrinking' | 'stable'

interface Segment {
  icon: string
  variant: SegmentVariant
  name: string
  detail: string
  visitGrowth: string
  visitColor: string
  avgBasket: string
  basketColor: string
}

const segments: Segment[] = [
  {
    icon: '🚀',
    variant: 'stable',
    name: 'Young Professionals (25–34)',
    detail: 'Weekday lunch + after-work peaks',
    visitGrowth: 'N/A',
    visitColor: 'text-secondary',
    avgBasket: '$0',
    basketColor: 'text-secondary',
  },
  {
    icon: '📱',
    variant: 'stable',
    name: 'Gen Z (18–24)',
    detail: 'Evening visits',
    visitGrowth: 'N/A',
    visitColor: 'text-secondary',
    avgBasket: '$0',
    basketColor: 'text-secondary',
  },
  {
    icon: '➡️',
    variant: 'stable',
    name: 'Families (35–44)',
    detail: 'Weekend morning peaks',
    visitGrowth: 'N/A',
    visitColor: 'text-secondary',
    avgBasket: '$0',
    basketColor: 'text-secondary',
  },
  {
    icon: '📉',
    variant: 'stable',
    name: 'Older Adults (45+)',
    detail: 'Morning visits',
    visitGrowth: 'N/A',
    visitColor: 'text-secondary',
    avgBasket: '$0',
    basketColor: 'text-secondary',
  },
]

const previewSegments: Segment[] = [
  { icon: '🚀', variant: 'growing', name: 'Young Professionals (25–34)', detail: 'Weekday lunch + after-work peaks', visitGrowth: '+18%', visitColor: 'text-accent', avgBasket: '$14.20', basketColor: 'text-accent' },
  { icon: '📱', variant: 'growing', name: 'Gen Z (18–24)', detail: 'Evening visits', visitGrowth: '+24%', visitColor: 'text-accent', avgBasket: '$9.80', basketColor: 'text-secondary' },
  { icon: '➡️', variant: 'stable', name: 'Families (35–44)', detail: 'Weekend morning peaks', visitGrowth: '+2%', visitColor: 'text-secondary', avgBasket: '$21.40', basketColor: 'text-accent' },
  { icon: '📉', variant: 'shrinking', name: 'Older Adults (45+)', detail: 'Morning visits', visitGrowth: '-6%', visitColor: 'text-danger', avgBasket: '$16.10', basketColor: 'text-secondary' },
]

const borderColor: Record<SegmentVariant, string> = {
  growing: 'border-l-accent',
  shrinking: 'border-l-danger',
  stable: 'border-l-muted',
}

const iconBg: Record<SegmentVariant, string> = {
  growing: 'bg-accent-light',
  shrinking: 'bg-danger-light',
  stable: 'bg-surface-alt',
}

export default function CustomerSegmentShifts({ previewMode }: { previewMode?: boolean } = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.marketingCustomerSegmentShifts] ?? true)
  if (!previewMode && !visible) return null

  const shownSegments = previewMode ? previewSegments.slice(0, 2) : segments

  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="px-[22px] py-4 border-b border-border">
        <div className="text-[13.5px] font-semibold">Customer Segment Shifts</div>
        <div className="text-[11.5px] text-muted mt-[2px]">Growing, stable, and shrinking visitor groups</div>
      </div>

      <div className="flex flex-col gap-[10px] px-[22px] py-5">
        {shownSegments.map((seg) => (
          <div
            key={seg.name}
            className={`flex items-center gap-3 px-[14px] py-3 border border-border rounded-[11px] border-l-[3px] ${borderColor[seg.variant]}`}
          >
            <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center text-[14px] shrink-0 ${iconBg[seg.variant]}`}>
              {seg.icon}
            </div>
            <div className="flex-1">
              <div className="text-[12.5px] font-semibold">{seg.name}</div>
              <div className="text-[11px] text-muted mt-px">{seg.detail}</div>
            </div>
            <div className="flex gap-[14px]">
              <div className="flex flex-col items-end gap-px">
                <div className={`font-mono text-[15px] font-bold ${seg.visitColor}`}>{seg.visitGrowth}</div>
                <div className="text-[9px] text-muted uppercase tracking-[.06em]">Visit growth</div>
              </div>
              <div className="flex flex-col items-end gap-px">
                <div className={`font-mono text-[15px] font-bold ${seg.basketColor}`}>{seg.avgBasket}</div>
                <div className="text-[9px] text-muted uppercase tracking-[.06em]">Avg basket</div>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-[2px] bg-surface-alt rounded-[9px] px-[13px] py-[10px] text-[12px] text-secondary leading-[1.5]">
          <strong className="font-semibold text-primary">Opportunity:</strong>{' '}
          {previewMode
            ? 'Gen Z visits are growing fastest (+24%) but spend the least per visit — a loyalty perk could lift their basket size.'
            : 'Segment growth data is not yet available for this period.'}
        </div>
      </div>
    </div>
  )
}
