interface WinCard {
  label: string
  icon: string
  iconVariant: 'green' | 'blue' | 'red' | 'amber'
  value: string
  valueVariant: 'green' | 'blue' | 'red' | 'amber'
  barWidth: string
  barColor: string
  barSuffix: string
  sub: string
  subBold: string
}

const CARDS: WinCard[] = [
  {
    label: 'Team Win Rate',
    icon: '✅',
    iconVariant: 'green',
    value: '68%',
    valueVariant: 'green',
    barWidth: '68%',
    barColor: 'var(--color-accent)',
    barSuffix: '68%',
    subBold: '17 of 25',
    sub: ' issues resolved this month',
  },
  {
    label: 'Avg. Time to Resolve',
    icon: '⏱',
    iconVariant: 'blue',
    value: '2.4',
    valueVariant: 'blue',
    barWidth: '48%',
    barColor: 'var(--color-cobalt)',
    barSuffix: 'wks',
    subBold: 'Target:',
    sub: ' under 3 weeks',
  },
  {
    label: 'AI Stalled Issues',
    icon: '🚨',
    iconVariant: 'red',
    value: '3',
    valueVariant: 'red',
    barWidth: '30%',
    barColor: 'var(--color-danger)',
    barSuffix: '3 flags',
    subBold: 'Need manager',
    sub: ' intervention now',
  },
  {
    label: 'Issues In Progress',
    icon: '🔄',
    iconVariant: 'amber',
    value: '5',
    valueVariant: 'amber',
    barWidth: '50%',
    barColor: 'var(--color-amber)',
    barSuffix: 'active',
    subBold: 'Across ',
    sub: '4 employees this week',
  },
]

const iconBg: Record<string, string> = {
  green: 'bg-accent-light',
  blue: 'bg-cobalt-light',
  red: 'bg-danger-light',
  amber: 'bg-amber-light',
}

const valueColor: Record<string, string> = {
  green: 'text-accent',
  blue: 'text-cobalt',
  red: 'text-danger',
  amber: 'text-amber',
}

const barSuffixColor: Record<string, string> = {
  green: 'text-accent',
  blue: 'text-cobalt',
  red: 'text-danger',
  amber: 'text-amber',
}

export default function CoachingWinStrip() {
  return (
    <div className="grid grid-cols-4 gap-[14px]">
      {CARDS.map((card) => (
        <div
          key={card.label}
          className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px] transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(0,0,0,.07)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{card.label}</span>
            <div className={`w-[27px] h-[27px] rounded-[8px] flex items-center justify-center text-[13px] ${iconBg[card.iconVariant]}`}>
              {card.icon}
            </div>
          </div>

          {/* Value */}
          <div className={`text-[30px] font-semibold tracking-[-0.02em] leading-none ${valueColor[card.valueVariant]}`}>
            {card.value}
          </div>

          {/* Bar */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-[6px] bg-surface-alt rounded-[3px] overflow-hidden">
              <div
                className="h-full rounded-[3px]"
                style={{ width: card.barWidth, background: card.barColor }}
              />
            </div>
            <span
              className={`font-mono text-[11px] font-medium shrink-0 ${barSuffixColor[card.valueVariant]}`}
            >
              {card.barSuffix}
            </span>
          </div>

          {/* Sub */}
          <div className="text-[11.5px] text-muted">
            <strong className="text-secondary font-medium">{card.subBold}</strong>
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
