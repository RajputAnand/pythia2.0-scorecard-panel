import type { ManagerDashboardSummary } from '@/types/manager-dashboard'

interface Props {
  summary: ManagerDashboardSummary | null
}

function KpiStripSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-[14px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px] animate-pulse"
        >
          <div className="h-3 w-24 rounded bg-border" />
          <div className="h-8 w-16 rounded bg-border" />
          <div className="h-[6px] w-full rounded bg-border" />
          <div className="h-3 w-36 rounded bg-border" />
        </div>
      ))}
    </div>
  )
}

export default function ManagerDashboardKpiStrip({ summary }: Props) {
  if (!summary) return <KpiStripSkeleton />

  const { thank_you, value_proposition, greeted_on_time, avg_overall_score, total_transactions } = summary
  const periodLabel = summary.view === 'week' ? 'this week' : 'all-time'

  const cards = [
    {
      key: 'thank_you',
      label: 'Thank-You Rate',
      icon: '🙏',
      iconBg: 'bg-accent-light',
      value: `${thank_you.rate}%`,
      valueColor: 'text-accent',
      barWidth: `${thank_you.rate}%`,
      barColor: 'var(--color-accent)',
      barSuffix: `${thank_you.count}`,
      barSuffixColor: 'text-accent',
      subBold: `${thank_you.count} of ${total_transactions}`,
      sub: ` transactions ${periodLabel}`,
    },
    {
      key: 'value_proposition',
      label: 'Value Proposition Rate',
      icon: '💡',
      iconBg: 'bg-cobalt-light',
      value: `${value_proposition.rate}%`,
      valueColor: 'text-cobalt',
      barWidth: `${value_proposition.rate}%`,
      barColor: 'var(--color-cobalt)',
      barSuffix: `${value_proposition.count}`,
      barSuffixColor: 'text-cobalt',
      subBold: 'Upsell or loyalty',
      sub: ' mentioned to customer',
    },
    {
      key: 'greeted_on_time',
      label: 'Greeted On Time',
      icon: '👋',
      iconBg: 'bg-amber-light',
      value: `${greeted_on_time.rate}%`,
      valueColor: 'text-amber',
      barWidth: `${greeted_on_time.rate}%`,
      barColor: 'var(--color-amber)',
      barSuffix: `${greeted_on_time.count}`,
      barSuffixColor: 'text-amber',
      subBold: 'Greeted within',
      sub: ' 10 seconds of arrival',
    },
    {
      key: 'avg_score',
      label: 'Avg. Overall Score',
      icon: '⭐',
      iconBg: 'bg-gold-light',
      value: `${avg_overall_score}`,
      valueColor: 'text-gold',
      barWidth: `${Math.min(100, Math.max(0, avg_overall_score))}%`,
      barColor: 'var(--color-gold)',
      barSuffix: 'pts',
      barSuffixColor: 'text-gold',
      subBold: `${summary.employees_scored}`,
      sub: ` employee${summary.employees_scored === 1 ? '' : 's'} scored ${periodLabel}`,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-[14px]">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px] transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(0,0,0,.07)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{card.label}</span>
            <div className={`w-[27px] h-[27px] rounded-[8px] flex items-center justify-center text-[13px] ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          <div className={`text-[30px] font-semibold tracking-[-0.02em] leading-none ${card.valueColor}`}>
            {card.value}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-[6px] bg-surface-alt rounded-[3px] overflow-hidden">
              <div className="h-full rounded-[3px]" style={{ width: card.barWidth, background: card.barColor }} />
            </div>
            <span className={`font-mono text-[11px] font-medium shrink-0 ${card.barSuffixColor}`}>{card.barSuffix}</span>
          </div>

          <div className="text-[11.5px] text-muted">
            {card.subBold && <strong className="text-secondary font-medium">{card.subBold}</strong>}
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
