'use client'

import type React from 'react'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { CustomerSegmentsResponse } from '@/types/demographics'

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

function mapSegmentData(data?: CustomerSegmentsResponse | null): Segment[] {
  if (!data || !data.segments || data.segments.length === 0) return segments

  return data.segments.map(item => {
    let variant: SegmentVariant = 'stable'
    let visitGrowth = 'N/A'
    let visitColor = 'text-secondary'
    
    if (item.visit_growth_percentage !== null && item.visit_growth_percentage !== undefined) {
      if (item.visit_growth_percentage > 0) {
        variant = 'growing'
        visitGrowth = `+${Math.round(item.visit_growth_percentage)}%`
        visitColor = 'text-accent'
      } else if (item.visit_growth_percentage < 0) {
        variant = 'shrinking'
        visitGrowth = `${Math.round(item.visit_growth_percentage)}%`
        visitColor = 'text-danger'
      } else {
        visitGrowth = '0%'
      }
    }
    
    let icon = '➡️'
    let name = item.segment_key
    let detail = ''
    
    if (item.segment_key === 'gen_z') {
      icon = '📱'
      name = 'Gen Z (18–24)'
      detail = 'Evening visits'
    } else if (item.segment_key === 'young_professionals') {
      icon = '🚀'
      name = 'Young Professionals (25–34)'
      detail = 'Weekday lunch + after-work peaks'
    } else if (item.segment_key === 'families') {
      icon = '➡️'
      name = 'Families (35–44)'
      detail = 'Weekend morning peaks'
    } else if (item.segment_key === 'older_adults') {
      icon = '📉'
      name = 'Older Adults (45+)'
      detail = 'Morning visits'
    }

    const avgBasket = item.avg_basket ? `$${item.avg_basket.toFixed(2)}` : '$0'
    const basketColor = item.avg_basket > 10 ? 'text-accent' : 'text-secondary'

    return {
      icon,
      variant,
      name,
      detail,
      visitGrowth,
      visitColor,
      avgBasket,
      basketColor
    }
  })
}

interface Props {
  previewMode?: boolean
  customerSegmentsData?: CustomerSegmentsResponse | null
}

export default function CustomerSegmentShifts({ previewMode, customerSegmentsData }: Props = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.managerCustomerSegmentShifts] ?? true)
  if (!previewMode && !visible) return null

  const shownSegments = previewMode ? previewSegments.slice(0, 2) : (customerSegmentsData ? mapSegmentData(customerSegmentsData) : segments)

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
            : (customerSegmentsData ? 'Data shows the latest segment trends based on store activity.' : 'Segment growth data is not yet available for this period.')}
        </div>
      </div>
    </div>
  )
}
