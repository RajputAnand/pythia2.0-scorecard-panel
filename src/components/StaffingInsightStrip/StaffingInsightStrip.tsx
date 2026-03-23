interface InsightCard {
  label: string
  icon: string
  iconVariant: 'red' | 'amber' | 'green' | 'blue'
  value: string
  valueVariant: 'red' | 'amber' | 'green' | 'blue'
  sub: string
  subBold: string
}

const CARDS: InsightCard[] = [
  {
    label: 'Coverage Gaps',
    icon: '⚠️',
    iconVariant: 'red',
    value: '3',
    valueVariant: 'red',
    subBold: '3 peak windows',
    sub: ' have no high-scorer scheduled this week',
  },
  {
    label: 'Fatigue Flags',
    icon: '😓',
    iconVariant: 'amber',
    value: '2',
    valueVariant: 'amber',
    subBold: 'Marcus & Devon',
    sub: ' show score drops after 8h shifts',
  },
  {
    label: 'Weak Pairings',
    icon: '👥',
    iconVariant: 'amber',
    value: '2',
    valueVariant: 'amber',
    subBold: 'Jamie scheduled alone',
    sub: ' on Thu & Fri with no top performer',
  },
  {
    label: 'Optimized Shifts',
    icon: '✅',
    iconVariant: 'green',
    value: '4',
    valueVariant: 'green',
    subBold: '4 of 7 days',
    sub: ' have strong coverage during peak hours',
  },
]

const iconBg: Record<string, string> = {
  red: 'bg-danger-light',
  amber: 'bg-amber-light',
  green: 'bg-accent-light',
  blue: 'bg-cobalt-light',
}

const valueColor: Record<string, string> = {
  red: 'text-danger',
  amber: 'text-amber',
  green: 'text-accent',
  blue: 'text-cobalt',
}

export default function StaffingInsightStrip() {
  return (
    <div className="grid grid-cols-4 gap-[14px]">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="bg-surface border border-border rounded-[13px] px-[18px] py-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{card.label}</span>
            <div className={`w-[26px] h-[26px] rounded-[8px] flex items-center justify-center text-[12px] ${iconBg[card.iconVariant]}`}>
              {card.icon}
            </div>
          </div>
          <div className={`font-mono text-[26px] font-bold tracking-[-0.02em] leading-none ${valueColor[card.valueVariant]}`}>
            {card.value}
          </div>
          <div className="text-[11.5px] text-muted leading-[1.4]">
            <strong className="text-secondary font-medium">{card.subBold}</strong>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
