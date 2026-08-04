'use client'

import type React from 'react'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

type KpiVariant = 'good' | 'ok' | 'bad' | 'neutral'
type ChangeVariant = 'up' | 'down' | 'flat'
type RoasVariant = 'great' | 'ok' | 'poor'

interface CampaignKpi {
  label: string
  value: string
  valueVariant: KpiVariant
  change: string
  changeVariant: ChangeVariant
}

interface Campaign {
  channelBarStyle: string
  name: string
  dates: string
  channelPillText: string
  channelPillBg: string
  channelPillColor: string
  statusDotColor: string
  statusText: string
  statusTextColor: string
  statusPulse?: boolean
  kpis: CampaignKpi[]
  trafficFillColor: string
  trafficFillWidth: string
  trafficVal: string
  trafficValColor: string
  insight: React.ReactNode
  roasLeftTop: string
  roasLeftSub: string
  roasVal: string
  roasVariant: RoasVariant
}

const kpiValueClass: Record<KpiVariant, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
  neutral: 'text-secondary',
}

const kpiChangeClass: Record<ChangeVariant, string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-muted',
}

const roasClass: Record<RoasVariant, string> = {
  great: 'text-accent',
  ok: 'text-amber',
  poor: 'text-danger',
}

const campaigns: Campaign[] = [
  {
    channelBarStyle: 'linear-gradient(90deg,#1E4D7A,#5A8ABF)',
    name: 'Winter Rush — Instagram + Facebook',
    dates: 'Dec 1 – Feb 28',
    channelPillText: '📱 Social',
    channelPillBg: '#E6EEF7',
    channelPillColor: '#1E4D7A',
    statusDotColor: '#1D5C3A',
    statusText: 'N/A',
    statusTextColor: '#1D5C3A',
    kpis: [
      { label: 'Spend',        value: '$0', valueVariant: 'neutral', change: 'N/A',  changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '0%', valueVariant: 'neutral', change: 'N/A',  changeVariant: 'flat' },
      { label: 'New Visitors', value: '0',  valueVariant: 'neutral', change: 'N/A',  changeVariant: 'flat' },
      { label: 'ROAS',         value: 'N/A', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
    ],
    trafficFillColor: '#1E4D7A',
    trafficFillWidth: '0%',
    trafficVal: '0%',
    trafficValColor: '#1E4D7A',
    insight: <><strong className="font-semibold text-primary">Performance data is not yet available.</strong> Figures will populate once live data is connected.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $0 spend',
    roasVal: '$0',
    roasVariant: 'ok',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#1D5C3A,#4DAA7A)',
    name: 'Hot Drinks Endcap Promo',
    dates: 'Jan 6 – Feb 3',
    channelPillText: '🏪 In-Store',
    channelPillBg: '#E6F2EC',
    channelPillColor: '#1D5C3A',
    statusDotColor: '#B0A89E',
    statusText: 'Ended · Results final',
    statusTextColor: '#B0A89E',
    kpis: [
      { label: 'Spend',        value: '$0', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '0%', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'Basket Lift',  value: '$0', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'ROAS',         value: 'N/A', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
    ],
    trafficFillColor: '#1D5C3A',
    trafficFillWidth: '0%',
    trafficVal: '0%',
    trafficValColor: '#1D5C3A',
    insight: <>Performance data is <strong className="font-semibold text-primary">not yet available</strong> for this campaign.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $0 spend',
    roasVal: '$0',
    roasVariant: 'ok',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#5C3A8C,#9B72CF)',
    name: 'Loyalty SMS — Sunday Morning Drop',
    dates: 'Nov 3 – ongoing',
    channelPillText: '✉️ Email/SMS',
    channelPillBg: '#F0EBF8',
    channelPillColor: '#5C3A8C',
    statusDotColor: '#C47F18',
    statusText: 'N/A',
    statusTextColor: '#C47F18',
    kpis: [
      { label: 'Spend',        value: '$0', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '0%', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'Open Rate',    value: '0%', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'ROAS',         value: 'N/A', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
    ],
    trafficFillColor: '#C47F18',
    trafficFillWidth: '0%',
    trafficVal: '0%',
    trafficValColor: '#C47F18',
    insight: <><strong className="font-semibold text-primary">Performance data is not yet available.</strong> Figures will populate once live data is connected.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $0 spend',
    roasVal: '$0',
    roasVariant: 'ok',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#C47F18,#E8A832)',
    name: 'Window Signage — New Spring Items',
    dates: 'Feb 10 – Mar 10',
    channelPillText: '🪟 Signage',
    channelPillBg: '#FDF5E4',
    channelPillColor: '#C47F18',
    statusDotColor: '#1E4D7A',
    statusText: 'N/A',
    statusTextColor: '#1E4D7A',
    statusPulse: true,
    kpis: [
      { label: 'Spend',        value: '$0', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '0%', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'Dwell Lift',   value: 'N/A', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
      { label: 'ROAS (est)',   value: 'N/A', valueVariant: 'neutral', change: 'N/A', changeVariant: 'flat' },
    ],
    trafficFillColor: '#C47F18',
    trafficFillWidth: '0%',
    trafficVal: '0%',
    trafficValColor: '#C47F18',
    insight: <>Performance data is <strong className="font-semibold text-primary">not yet available</strong> for this campaign.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $0 spend',
    roasVal: '$0',
    roasVariant: 'ok',
  },
]

const previewCampaigns: Campaign[] = [
  {
    channelBarStyle: 'linear-gradient(90deg,#1E4D7A,#5A8ABF)',
    name: 'Winter Rush — Instagram + Facebook',
    dates: 'Dec 1 – Feb 28',
    channelPillText: '📱 Social',
    channelPillBg: '#E6EEF7',
    channelPillColor: '#1E4D7A',
    statusDotColor: '#1D5C3A',
    statusText: 'Active',
    statusTextColor: '#1D5C3A',
    statusPulse: true,
    kpis: [
      { label: 'Spend', value: '$2,400', valueVariant: 'neutral', change: '', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+18%', valueVariant: 'good', change: '↑ 4%', changeVariant: 'up' },
      { label: 'New Visitors', value: '640', valueVariant: 'good', change: '↑ 12%', changeVariant: 'up' },
      { label: 'ROAS', value: '4.1x', valueVariant: 'good', change: '↑ 0.3x', changeVariant: 'up' },
    ],
    trafficFillColor: '#1E4D7A',
    trafficFillWidth: '68%',
    trafficVal: '+18%',
    trafficValColor: '#1E4D7A',
    insight: <><strong className="font-semibold text-primary">Best-performing campaign this quarter</strong> — 4.1x ROAS and climbing.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $2,400 spend',
    roasVal: '$9,840',
    roasVariant: 'great',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#1D5C3A,#4DAA7A)',
    name: 'Hot Drinks Endcap Promo',
    dates: 'Jan 6 – Feb 3',
    channelPillText: '🏪 In-Store',
    channelPillBg: '#E6F2EC',
    channelPillColor: '#1D5C3A',
    statusDotColor: '#B0A89E',
    statusText: 'Ended · Results final',
    statusTextColor: '#B0A89E',
    kpis: [
      { label: 'Spend', value: '$800', valueVariant: 'neutral', change: '', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+9%', valueVariant: 'good', change: '', changeVariant: 'flat' },
      { label: 'Basket Lift', value: '$3.10', valueVariant: 'good', change: '', changeVariant: 'flat' },
      { label: 'ROAS', value: '2.6x', valueVariant: 'ok', change: '', changeVariant: 'flat' },
    ],
    trafficFillColor: '#1D5C3A',
    trafficFillWidth: '48%',
    trafficVal: '+9%',
    trafficValColor: '#1D5C3A',
    insight: <>Solid seasonal lift — <strong className="font-semibold text-primary">basket size up $3.10</strong> per transaction during the promo window.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $800 spend',
    roasVal: '$2,080',
    roasVariant: 'ok',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#5C3A8C,#9B72CF)',
    name: 'Loyalty SMS — Sunday Morning Drop',
    dates: 'Nov 3 – ongoing',
    channelPillText: '✉️ Email/SMS',
    channelPillBg: '#F0EBF8',
    channelPillColor: '#5C3A8C',
    statusDotColor: '#1D5C3A',
    statusText: 'Active',
    statusTextColor: '#1D5C3A',
    statusPulse: true,
    kpis: [
      { label: 'Spend', value: '$150', valueVariant: 'neutral', change: '', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+6%', valueVariant: 'good', change: '↑ 1%', changeVariant: 'up' },
      { label: 'Open Rate', value: '38%', valueVariant: 'good', change: '↑ 3%', changeVariant: 'up' },
      { label: 'ROAS', value: '5.8x', valueVariant: 'good', change: '', changeVariant: 'flat' },
    ],
    trafficFillColor: '#5C3A8C',
    trafficFillWidth: '32%',
    trafficVal: '+6%',
    trafficValColor: '#5C3A8C',
    insight: <>Cheapest channel by far — <strong className="font-semibold text-primary">5.8x ROAS</strong> on a $150 monthly spend.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $150 spend',
    roasVal: '$870',
    roasVariant: 'great',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#C47F18,#E8A832)',
    name: 'Window Signage — New Spring Items',
    dates: 'Feb 10 – Mar 10',
    channelPillText: '🪟 Signage',
    channelPillBg: '#FDF5E4',
    channelPillColor: '#C47F18',
    statusDotColor: '#1E4D7A',
    statusText: 'Scheduled',
    statusTextColor: '#1E4D7A',
    kpis: [
      { label: 'Spend', value: '$400', valueVariant: 'neutral', change: '', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: 'TBD', valueVariant: 'neutral', change: '', changeVariant: 'flat' },
      { label: 'Dwell Lift', value: 'TBD', valueVariant: 'neutral', change: '', changeVariant: 'flat' },
      { label: 'ROAS (est)', value: '1.8x', valueVariant: 'ok', change: '', changeVariant: 'flat' },
    ],
    trafficFillColor: '#C47F18',
    trafficFillWidth: '18%',
    trafficVal: 'TBD',
    trafficValColor: '#C47F18',
    insight: <>Starts next week — projected <strong className="font-semibold text-primary">1.8x ROAS</strong> based on last spring&apos;s similar campaign.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $400 spend',
    roasVal: '$720',
    roasVariant: 'ok',
  },
]

export default function CampaignCards({ previewMode }: { previewMode?: boolean } = {}) {
  const visible = useAdminConfigStore((s) => s.visibility[KPI_IDS.marketingCampaignCards] ?? true)
  if (!previewMode && !visible) return null

  const shownCampaigns = previewMode ? previewCampaigns.slice(0, 2) : campaigns

  return (
    <div>
      <div className="flex items-start justify-between mb-[14px]">
        <div>
          <div className="text-[13.5px] font-semibold">Campaign Performance Cards</div>
          <div className="text-[11.5px] text-muted mt-[2px]">All active and recent campaigns · Click any card to drill in</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-[14px]">
        {shownCampaigns.map((c) => (
          <div key={c.name} className="bg-surface border border-border rounded-[14px] overflow-hidden flex flex-col transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(0,0,0,0.07)]">

            {/* Card top */}
            <div className="px-[18px] pt-4 pb-[14px] border-b border-border">
              <div className="h-[3px] w-full rounded mb-3" style={{ background: c.channelBarStyle }} />
              <div className="flex items-start justify-between gap-[10px]">
                <div>
                  <div className="text-[13.5px] font-bold leading-[1.2]">{c.name}</div>
                  <div className="font-mono text-[11px] text-muted mt-1">{c.dates}</div>
                </div>
                <div
                  className="text-[9.5px] font-bold px-2 py-[3px] rounded-full uppercase tracking-[.06em] whitespace-nowrap shrink-0"
                  style={{ background: c.channelPillBg, color: c.channelPillColor }}
                >
                  {c.channelPillText}
                </div>
              </div>
              <div className="flex items-center gap-[5px] mt-2">
                <div
                  className={`w-[6px] h-[6px] rounded-full shrink-0 ${c.statusPulse ? 'animate-pulse' : ''}`}
                  style={{ background: c.statusDotColor }}
                />
                <div className="text-[11px] font-semibold" style={{ color: c.statusTextColor }}>{c.statusText}</div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-b border-border">
              {c.kpis.map((kpi, i) => (
                <div key={kpi.label} className={`flex flex-col gap-[3px] px-[14px] py-[11px] ${i < 3 ? 'border-r border-border' : ''}`}>
                  <div className="text-[9px] text-muted uppercase tracking-[.08em]">{kpi.label}</div>
                  <div className={`font-mono text-[15px] font-bold ${kpiValueClass[kpi.valueVariant]}`}>{kpi.value}</div>
                  <div className={`font-mono text-[9.5px] font-semibold ${kpiChangeClass[kpi.changeVariant]}`}>{kpi.change}</div>
                </div>
              ))}
            </div>

            {/* Traffic bar */}
            <div className="flex items-center gap-[10px] px-[18px] py-[11px] border-b border-border">
              <div className="text-[10.5px] text-muted shrink-0 w-20">Traffic vs baseline</div>
              <div className="flex-1 h-2 bg-surface-alt rounded overflow-hidden relative">
                <div className="h-full rounded" style={{ width: c.trafficFillWidth, background: c.trafficFillColor }} />
                <div className="absolute top-0 h-full w-[2px] left-1/2 bg-black/15" />
              </div>
              <div className="font-mono text-[11px] font-bold shrink-0" style={{ color: c.trafficValColor }}>{c.trafficVal}</div>
            </div>

            {/* Insight */}
            <div className="px-[18px] py-[10px] text-[12px] text-secondary leading-[1.5]">{c.insight}</div>

            {/* ROAS */}
            <div className="flex items-center justify-between px-[18px] pb-[14px] pt-[10px] border-t border-border mt-auto">
              <div className="text-[11px] text-muted">
                {c.roasLeftTop}<br />
                <span className="text-[10px]">{c.roasLeftSub}</span>
              </div>
              <div className={`font-mono text-[16px] font-bold ${roasClass[c.roasVariant]}`}>{c.roasVal}</div>
            </div>

          </div>
        ))}
      </div>
    </div>
  )
}
