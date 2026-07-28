import type React from 'react'

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
    dates: 'Dec 1 – Feb 28 · 90 days',
    channelPillText: '📱 Social',
    channelPillBg: '#E6EEF7',
    channelPillColor: '#1E4D7A',
    statusDotColor: '#1D5C3A',
    statusText: 'Active · 28 days remaining',
    statusTextColor: '#1D5C3A',
    kpis: [
      { label: 'Spend',        value: '$1,200', valueVariant: 'neutral', change: 'of $1,500 budget',    changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+24%',   valueVariant: 'good',    change: '↑ vs. baseline',     changeVariant: 'up'   },
      { label: 'New Visitors', value: '+312',   valueVariant: 'good',    change: '↑ Node 2 tracked',   changeVariant: 'up'   },
      { label: 'ROAS',         value: '3.4×',   valueVariant: 'good',    change: '↑ Best channel',     changeVariant: 'up'   },
    ],
    trafficFillColor: '#1E4D7A',
    trafficFillWidth: '74%',
    trafficVal: '+24%',
    trafficValColor: '#1E4D7A',
    insight: <><strong className="font-semibold text-primary">Strongest performer this period.</strong> 25–34 age group drove 68% of new foot traffic from this campaign. Consider extending budget through March given ROAS trajectory.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $1,200 spend',
    roasVal: '$4,080',
    roasVariant: 'great',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#1D5C3A,#4DAA7A)',
    name: 'Hot Drinks Endcap Promo',
    dates: 'Jan 6 – Feb 3 · 28 days',
    channelPillText: '🏪 In-Store',
    channelPillBg: '#E6F2EC',
    channelPillColor: '#1D5C3A',
    statusDotColor: '#B0A89E',
    statusText: 'Ended · Results final',
    statusTextColor: '#B0A89E',
    kpis: [
      { label: 'Spend',        value: '$280',   valueVariant: 'neutral', change: 'Display + product cost', changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+11%',   valueVariant: 'good',    change: '↑ Peak window',         changeVariant: 'up'   },
      { label: 'Basket Lift',  value: '+$1.40', valueVariant: 'good',    change: '↑ Add-on attach',       changeVariant: 'up'   },
      { label: 'ROAS',         value: '2.8×',   valueVariant: 'good',    change: '↑ Strong ROI',          changeVariant: 'up'   },
    ],
    trafficFillColor: '#1D5C3A',
    trafficFillWidth: '61%',
    trafficVal: '+11%',
    trafficValColor: '#1D5C3A',
    insight: <>Drove measurable basket lift from <strong className="font-semibold text-primary">hot drink add-ons</strong> during cold January mornings. 35–44 segment over-indexed on this promo. Consider repeating in Feb with a coffee + snack bundle.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $280 spend',
    roasVal: '$784',
    roasVariant: 'great',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#5C3A8C,#9B72CF)',
    name: 'Loyalty SMS — Sunday Morning Drop',
    dates: 'Nov 3 – ongoing · Weekly',
    channelPillText: '✉️ Email/SMS',
    channelPillBg: '#F0EBF8',
    channelPillColor: '#5C3A8C',
    statusDotColor: '#C47F18',
    statusText: 'Active · Underperforming',
    statusTextColor: '#C47F18',
    kpis: [
      { label: 'Spend',        value: '$420', valueVariant: 'neutral', change: '$105/mo · 4 months',  changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+4%',  valueVariant: 'ok',      change: 'Sundays only',        changeVariant: 'flat' },
      { label: 'Open Rate',    value: '18%',  valueVariant: 'ok',      change: '↓ Declining',         changeVariant: 'down' },
      { label: 'ROAS',         value: '1.4×', valueVariant: 'ok',      change: '↓ Below target',      changeVariant: 'down' },
    ],
    trafficFillColor: '#C47F18',
    trafficFillWidth: '54%',
    trafficVal: '+4%',
    trafficValColor: '#C47F18',
    insight: <><strong className="font-semibold text-primary">Weakest performer — consider pausing.</strong> Open rate has dropped 6 points since November. Sunday traffic lift is minimal. The $105/mo could be reallocated to social for 3× the traffic response.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $420 spend',
    roasVal: '$588',
    roasVariant: 'ok',
  },
  {
    channelBarStyle: 'linear-gradient(90deg,#C47F18,#E8A832)',
    name: 'Window Signage — New Spring Items',
    dates: 'Feb 10 – Mar 10 · 28 days',
    channelPillText: '🪟 Signage',
    channelPillBg: '#FDF5E4',
    channelPillColor: '#C47F18',
    statusDotColor: '#1E4D7A',
    statusText: 'New · 14 days in · Early data',
    statusTextColor: '#1E4D7A',
    statusPulse: true,
    kpis: [
      { label: 'Spend',        value: '$180', valueVariant: 'neutral', change: 'Print + install',     changeVariant: 'flat' },
      { label: 'Traffic Lift', value: '+9%',  valueVariant: 'good',    change: '↑ 14-day avg',       changeVariant: 'up'   },
      { label: 'Dwell Lift',   value: '+22s', valueVariant: 'good',    change: '↑ Node 2 tracked',   changeVariant: 'up'   },
      { label: 'ROAS (est)',   value: '1.8×', valueVariant: 'good',    change: 'Early estimate',      changeVariant: 'flat' },
    ],
    trafficFillColor: '#C47F18',
    trafficFillWidth: '59%',
    trafficVal: '+9%',
    trafficValColor: '#C47F18',
    insight: <>Early signal is positive — <strong className="font-semibold text-primary">+22 seconds of added dwell time</strong> suggests window browsers are entering and engaging. Node 2 shows a bump in 35–44 visits, suggesting signage resonates with this segment more than social does.</>,
    roasLeftTop: 'Est. revenue generated',
    roasLeftSub: 'vs. $180 spend · 14 days only',
    roasVal: '$324 so far',
    roasVariant: 'ok',
  },
]

export default function CampaignCards() {
  return (
    <div>
      <div className="flex items-start justify-between mb-[14px]">
        <div>
          <div className="text-[13.5px] font-semibold">Campaign Performance Cards</div>
          <div className="text-[11.5px] text-muted mt-[2px]">All active and recent campaigns · Click any card to drill in</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr] gap-[14px]">
        {campaigns.map((c) => (
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
