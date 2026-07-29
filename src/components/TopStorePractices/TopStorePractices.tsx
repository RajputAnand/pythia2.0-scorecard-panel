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
    title: 'Checkout speed',
    desc: <>Top-performing stores average <strong className="font-semibold text-primary">N/A per transaction</strong>. Comparison data for your store is not yet available.</>,
    pillText: 'Your gap: N/A',
    pillVariant: 'gap',
  },
  {
    icon: '👋',
    iconColor: 'green',
    title: 'Greeting speed and consistency',
    desc: <>Top performers greet customers with <strong className="font-semibold text-primary">N/A consistency</strong>. Comparison data for your store is not yet available.</>,
    pillText: 'Your gap: N/A',
    pillVariant: 'close',
  },
  {
    icon: '🔄',
    iconColor: 'blue',
    title: 'Zero dead air during transactions',
    desc: <>Top stores show <strong className="font-semibold text-primary">active verbal engagement throughout the transaction</strong> — not just greeting and close. Comparison data for your store is not yet available.</>,
    pillText: 'Your gap: N/A',
    pillVariant: 'gap',
  },
  {
    icon: '📅',
    iconColor: 'amber',
    title: 'High scorers always on during peak',
    desc: <>Network&apos;s top stores schedule their <strong className="font-semibold text-primary">top performers during every peak window</strong> without exception. Staffing comparison data for your store is not yet available.</>,
    pillText: 'Your gap: N/A',
    pillVariant: 'gap',
  },
  {
    icon: '📈',
    iconColor: 'green',
    title: 'Coaching resolution speed',
    desc: <>Top stores resolve coaching issues in an average of <strong className="font-semibold text-primary">N/A</strong>. Comparison data for your team is not yet available.</>,
    pillText: 'Your gap: N/A',
    pillVariant: 'close',
  },
  {
    icon: '🏆',
    iconColor: 'blue',
    title: 'Staff score floor',
    desc: <>Top-ranked stores have <strong className="font-semibold text-primary">no employee below the score threshold</strong>. Staff score data for your store is not yet available.</>,
    pillText: 'Your gap: N/A',
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
