'use client'

import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

const cards = [
  {
    id: KPI_IDS.marketingFootTraffic,
    label: 'Total Foot Traffic',
    icon: '🚶',
    iconBg: 'bg-accent-light',
    value: '0%',
    valueColor: 'text-accent',
    sub: <><strong className="text-secondary font-medium">N/A</strong> vs. prior period · Node 2</>,
  },
  {
    id: KPI_IDS.marketingBestChannel,
    label: 'Best Channel',
    icon: '📱',
    iconBg: 'bg-cobalt-light',
    value: 'N/A',
    valueColor: 'text-cobalt',
    sub: <><strong className="text-secondary font-medium">N/A ROAS</strong> · highest traffic-per-dollar</>,
  },
  {
    id: KPI_IDS.marketingFastestGrowingSegment,
    label: 'Fastest Growing Segment',
    icon: '📈',
    iconBg: 'bg-purple-light',
    value: 'N/A',
    valueColor: 'text-purple',
    sub: <><strong className="text-secondary font-medium">N/A</strong> this period vs. last</>,
  },
  {
    id: KPI_IDS.marketingActiveCampaigns,
    label: 'Active Campaigns',
    icon: '📣',
    iconBg: 'bg-amber-light',
    value: '0',
    valueColor: 'text-amber',
    sub: <><strong className="text-secondary font-medium">N/A</strong></>,
  },
]

const previewCards: typeof cards = [
  { id: KPI_IDS.marketingFootTraffic, label: 'Total Foot Traffic', icon: '🚶', iconBg: 'bg-accent-light', value: '+9%', valueColor: 'text-accent', sub: <><strong className="text-secondary font-medium">+9%</strong> vs. prior period · Node 2</> },
  { id: KPI_IDS.marketingBestChannel, label: 'Best Channel', icon: '📱', iconBg: 'bg-cobalt-light', value: 'Social', valueColor: 'text-cobalt', sub: <><strong className="text-secondary font-medium">4.1x ROAS</strong> · highest traffic-per-dollar</> },
  { id: KPI_IDS.marketingFastestGrowingSegment, label: 'Fastest Growing Segment', icon: '📈', iconBg: 'bg-purple-light', value: 'Gen Z', valueColor: 'text-purple', sub: <><strong className="text-secondary font-medium">+18%</strong> this period vs. last</> },
  { id: KPI_IDS.marketingActiveCampaigns, label: 'Active Campaigns', icon: '📣', iconBg: 'bg-amber-light', value: '4', valueColor: 'text-amber', sub: <><strong className="text-secondary font-medium">2</strong> ending this month</> },
]

interface MarketingInsightStripProps {
  previewMode?: boolean
  /** Super Admin preview only — dims every card except the one being previewed, so it's obvious which card a given row controls. */
  highlightId?: string
}

export default function MarketingInsightStrip({ previewMode, highlightId }: MarketingInsightStripProps = {}) {
  const storeVisibility = useAdminConfigStore((s) => s.visibility)
  const visibility = previewMode ? {} : storeVisibility
  const visibleCards = (previewMode ? previewCards : cards).filter((c) => visibility[c.id] ?? true)

  if (visibleCards.length === 0) return null

  return (
    <div className="grid gap-[14px]" style={{ gridTemplateColumns: `repeat(${visibleCards.length}, 1fr)` }}>
      {visibleCards.map((c) => {
        const dimmed = highlightId != null && c.id !== highlightId
        return (
        <div
          key={c.label}
          className={`bg-surface border rounded-[13px] px-[18px] py-4 flex flex-col gap-2 transition-all duration-200 ${
            dimmed
              ? 'border-border opacity-35 blur-[1.5px] saturate-50'
              : highlightId != null
                ? 'border-accent ring-2 ring-accent/40 shadow-[0_4px_18px_rgba(0,0,0,.07)]'
                : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{c.label}</span>
            <div className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center text-[12px] ${c.iconBg}`}>
              {c.icon}
            </div>
          </div>
          <div className={`font-mono text-[26px] font-bold tracking-[-0.02em] leading-none ${c.valueColor}`}>{c.value}</div>
          <div className="text-[11.5px] text-muted leading-[1.4]">{c.sub}</div>
        </div>
        )
      })}
    </div>
  )
}
