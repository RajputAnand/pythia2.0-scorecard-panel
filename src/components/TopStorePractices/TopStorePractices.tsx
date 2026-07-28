type IconColor = 'green' | 'amber' | 'blue'
type GapVariant = 'gap' | 'close'

interface Practice {
  icon: string
  iconColor: IconColor
  title: string
  desc: React.ReactNode
  pillText: string
  pillVariant: GapVariant
}

import type React from 'react'

const iconBg: Record<IconColor, string> = {
  green: 'bg-accent-light',
  amber: 'bg-amber-light',
  blue: 'bg-cobalt-light',
}

const pillStyle: Record<GapVariant, string> = {
  gap: 'bg-amber-light text-amber',
  close: 'bg-accent-light text-accent',
}

const practices: Practice[] = [
  {
    icon: '⚡',
    iconColor: 'green',
    title: 'Checkout under 22s average',
    desc: <>Top 3 stores average <strong className="font-semibold text-primary">21.4s per transaction</strong> vs. your 29s. They use a standardized scan-bag-receipt sequence that eliminates dead time between items. This is the single biggest gap between you and #1.</>,
    pillText: 'Your gap: −7.6s avg · #11 in checkout',
    pillVariant: 'gap',
  },
  {
    icon: '👋',
    iconColor: 'green',
    title: 'Greeting within 2.8s — every time',
    desc: <>Top performers greet customers in under 3 seconds with <strong className="font-semibold text-primary">96% consistency</strong>. Your store averages 4.1s with 84% consistency. The gap isn't big — just consistency training with your 1–2 weaker performers would close it.</>,
    pillText: 'Your gap: 1.3s · Closeable in 4–6 wks',
    pillVariant: 'close',
  },
  {
    icon: '🔄',
    iconColor: 'blue',
    title: 'Zero dead air during transactions',
    desc: <>Top stores show <strong className="font-semibold text-primary">active verbal engagement throughout the transaction</strong> — not just greeting and close. Your store has strong open and close scores but dips in the middle. Node 1's speaker analysis flags this as "mid-transaction silence."</>,
    pillText: 'Your gap: Mid-transaction engagement −18pts',
    pillVariant: 'gap',
  },
  {
    icon: '📅',
    iconColor: 'amber',
    title: 'High scorers always on during peak',
    desc: <>Network's top stores schedule their <strong className="font-semibold text-primary">top-2 performers during every peak window</strong> without exception. Our staffing data shows your top 2 cover peak hours only 71% of the time — 3 windows per week are uncovered.</>,
    pillText: 'Your gap: 3 uncovered peak windows/week',
    pillVariant: 'gap',
  },
  {
    icon: '📈',
    iconColor: 'green',
    title: 'Coaching resolution under 2 weeks',
    desc: <>Top stores resolve coaching issues in an average of <strong className="font-semibold text-primary">1.8 weeks</strong>. Your team averages 2.4 weeks, with 3 issues stalled beyond 3 weeks. Faster human escalation — not more AI coaching — is the differentiator.</>,
    pillText: 'Your gap: +0.6 wks avg · Closeable now',
    pillVariant: 'close',
  },
  {
    icon: '🏆',
    iconColor: 'blue',
    title: 'All staff above 75 score threshold',
    desc: <>Stores ranked #1–3 have <strong className="font-semibold text-primary">no employee below a 75 overall score</strong>. Your store has 2 employees below this threshold (Jamie: 66, Sofia: 69). Raising your floor matters more than improving your ceiling right now.</>,
    pillText: 'Your gap: 2 staff below 75 · Floor problem',
    pillVariant: 'gap',
  },
]

export default function TopStorePractices() {
  return (
    <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border">
        <div>
          <div className="text-[13.5px] font-semibold">What Top-Ranked Stores Do Differently</div>
          <div className="text-[11.5px] text-muted mt-[2px]">Aggregated behavioral patterns from stores ranked #1–3 in the Pythia network</div>
        </div>
        <div className="text-[10px] font-semibold px-[9px] py-[3px] rounded-full bg-gold-light text-gold tracking-[.05em]">
          Network Intelligence
        </div>
      </div>

      <div className="grid grid-cols-3">
        {practices.map((p, i) => (
          <div
            key={p.title}
            className={`flex flex-col gap-[10px] p-[22px]
              ${(i + 1) % 3 !== 0 ? 'border-r border-border' : ''}
              ${i < 3 ? 'border-b border-border' : ''}`}
          >
            <div className="flex items-start gap-[10px]">
              <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center text-[15px] shrink-0 ${iconBg[p.iconColor]}`}>
                {p.icon}
              </div>
              <div className="text-[13px] font-semibold leading-[1.3]">{p.title}</div>
            </div>
            <div className="text-[12px] text-secondary leading-[1.55]">{p.desc}</div>
            <div className={`inline-flex items-center gap-1 text-[10.5px] font-semibold px-[9px] py-[3px] rounded-full w-fit ${pillStyle[p.pillVariant]}`}>
              {p.pillText}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
