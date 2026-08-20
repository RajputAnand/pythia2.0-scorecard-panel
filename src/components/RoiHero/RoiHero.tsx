'use client'

import styles from './RoiHero.module.css'
import { RoiStat } from '@/types/roi'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'
import type { RoiAttributionResponse } from '@/types/owner-roi'

// Illustrative numbers for the Super Admin hover preview — never shown on
// the real page, which sources these stats from live backend data instead.
const PREVIEW_STATS: RoiStat[] = [
  { label: 'Est. Revenue Impact', value: '$18,400', valueVariant: 'green', pill: '+12%', pillVariant: 'up', sub: 'vs. prior period' },
  { label: 'Team Score Avg', value: '76 → 84', valueVariant: 'green', pill: '+8 pts', pillVariant: 'up', sub: 'this period' },
  { label: 'Pythia Platform Cost', value: '$1,200', valueVariant: 'amber', pill: '$1,200/mo', pillVariant: 'neutral', sub: 'prorated for 30 days' },
  { label: 'Net ROI', value: '$17,200', valueVariant: 'green', pill: '14.3x', pillVariant: 'up', sub: 'after platform cost' },
]

const valueColorClass: Record<string, string> = {
  green: 'text-[#78C99A]',
  amber: 'text-[#F5C842]',
}

const pillVariantStyle: Record<string, React.CSSProperties> = {
  up:      { background: 'rgba(29,92,58,0.5)',    color: '#78C99A' },
  down:    { background: 'rgba(181,43,30,0.4)',   color: '#F5A49E' },
  neutral: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' },
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function RoiHero({ data, previewMode }: { data?: RoiAttributionResponse['hero']; previewMode?: boolean } = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.roiHero] ?? true)
  if (!previewMode && !visible) return null

  let stats: RoiStat[] = PREVIEW_STATS

  if (!previewMode && data) {
    stats = [
      {
        label: 'Est. Revenue Impact',
        value: data.revenue_impact.amount != null ? formatCurrency(data.revenue_impact.amount) : 'N/A',
        valueVariant: (data.revenue_impact.amount ?? 0) >= 0 ? 'green' : 'amber',
        pill: data.revenue_impact.percent_change != null ? `${data.revenue_impact.percent_change > 0 ? '+' : ''}${data.revenue_impact.percent_change}%` : 'N/A',
        pillVariant: (data.revenue_impact.percent_change ?? 0) >= 0 ? 'up' : 'down',
        sub: 'vs. prior period'
      },
      {
        label: 'Team Score Avg',
        value: (data.team_score.start_score != null && data.team_score.end_score != null) ? `${data.team_score.start_score.toFixed(1)} → ${data.team_score.end_score.toFixed(1)}` : 'N/A',
        valueVariant: (data.team_score.change ?? 0) >= 0 ? 'green' : 'amber',
        pill: data.team_score.change != null ? `${data.team_score.change > 0 ? '+' : ''}${data.team_score.change.toFixed(1)} pts` : 'N/A',
        pillVariant: (data.team_score.change ?? 0) >= 0 ? 'up' : 'down',
        sub: 'this period'
      },
      {
        label: 'Pythia Platform Cost',
        value: data.platform_cost.amount != null ? formatCurrency(Math.abs(data.platform_cost.amount)) : 'N/A',
        valueVariant: 'amber',
        pill: data.platform_cost.monthly_rate != null ? `${formatCurrency(data.platform_cost.monthly_rate)}/mo` : 'flat',
        pillVariant: 'neutral',
        sub: data.platform_cost.period_days != null
          ? `prorated for ${data.platform_cost.period_days} day${data.platform_cost.period_days === 1 ? '' : 's'}`
          : 'monthly subscription'
      },
      {
        label: 'Net ROI',
        value: data.net_roi.amount != null ? formatCurrency(data.net_roi.amount) : 'N/A',
        valueVariant: (data.net_roi.amount ?? 0) >= 0 ? 'green' : 'amber',
        pill: data.net_roi.multiplier != null ? `${data.net_roi.multiplier}x` : 'N/A',
        pillVariant: (data.net_roi.multiplier ?? 0) >= 0 ? 'up' : 'down',
        sub: 'after platform cost'
      }
    ]
  }

  return (
    <div
      className={`${styles.roiHero} relative rounded-2xl overflow-hidden grid`}
      style={{
        background: 'linear-gradient(135deg, #1A1714 0%, #2A2218 60%, #1D3828 100%)',
        padding: '28px 32px',
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className="flex flex-col gap-[6px] pr-[28px] mr-[28px]"
          style={i === stats.length - 1 ? { paddingRight: 0, marginRight: 0, borderRight: 'none' } : { borderRight: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div
            className="font-medium uppercase text-[10px]"
            style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em' }}
          >
            {stat.label}
          </div>
          <div
            className={`font-mono font-medium text-[32px] leading-none ${valueColorClass[stat.valueVariant] ?? 'text-white'}`}
            style={{ letterSpacing: '-.02em' }}
          >
            {stat.value.split('→').flatMap((part, i, arr) =>
              i < arr.length - 1
                ? [part, <span key={i} style={{ fontFamily: 'system-ui, sans-serif' }}>→</span>]
                : [part]
            )}
          </div>
          <div className="flex items-center gap-[6px] text-[11.5px]">
            <span
              className="font-mono font-semibold rounded-[20px] text-[10.5px] px-[7px] py-[2px]"
              style={pillVariantStyle[stat.pillVariant]}
            >
              {stat.pill}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{stat.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

