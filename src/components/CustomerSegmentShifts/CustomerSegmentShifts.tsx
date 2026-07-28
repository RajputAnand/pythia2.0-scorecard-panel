import type React from 'react'

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
    variant: 'growing',
    name: 'Young Professionals (25–34)',
    detail: 'Weekday lunch + after-work peaks · Instagram-driven',
    visitGrowth: '+31%',
    visitColor: 'text-accent',
    avgBasket: '$9.80',
    basketColor: 'text-accent',
  },
  {
    icon: '📱',
    variant: 'growing',
    name: 'Gen Z (18–24)',
    detail: 'Evening visits · High frequency, lower basket',
    visitGrowth: '+22%',
    visitColor: 'text-accent',
    avgBasket: '$6.40',
    basketColor: 'text-secondary',
  },
  {
    icon: '➡️',
    variant: 'stable',
    name: 'Families (35–44)',
    detail: 'Weekend morning peaks · Stable but not growing',
    visitGrowth: '−1%',
    visitColor: 'text-secondary',
    avgBasket: '$12.20',
    basketColor: 'text-accent',
  },
  {
    icon: '📉',
    variant: 'shrinking',
    name: 'Older Adults (45+)',
    detail: 'Morning visits · Highest basket, but declining',
    visitGrowth: '−18%',
    visitColor: 'text-danger',
    avgBasket: '$14.60',
    basketColor: 'text-accent',
  },
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

export default function CustomerSegmentShifts() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="px-[22px] py-4 border-b border-border">
        <div className="text-[13.5px] font-semibold">Customer Segment Shifts</div>
        <div className="text-[11.5px] text-muted mt-[2px]">Growing, stable, and shrinking visitor groups</div>
      </div>

      <div className="flex flex-col gap-[10px] px-[22px] py-5">
        {segments.map((seg) => (
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
          <strong className="font-semibold text-primary">Opportunity:</strong> The 45+ segment has your highest avg basket ($14.60) but is declining fastest (−18%). A signage or direct mail campaign targeted at this group could recover high-value visits — they're not going to Instagram.
        </div>
      </div>
    </div>
  )
}
