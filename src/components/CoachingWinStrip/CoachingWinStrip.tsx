import type { CoachingSummary } from '@/types/coaching-plan'

interface Props {
  summary: CoachingSummary | null
}

function WinStripSkeleton() {
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

export default function CoachingWinStrip({ summary }: Props) {
  if (!summary) return <WinStripSkeleton />

  const { team_win_rate, avg_time_to_resolve, ai_stalled, in_progress } = summary

  const avgWeeksDisplay = avg_time_to_resolve.weeks ?? 0
  // Bar fill is relative to the 3-week target — capped at 100% so an
  // above-target average doesn't overflow the track.
  const avgWeeksBarPct = Math.min(100, Math.round((avgWeeksDisplay / avg_time_to_resolve.target_weeks) * 100))
  const stalledBarPct = Math.min(100, ai_stalled.count * 10)
  const inProgressBarPct = Math.min(100, in_progress.count * 10)

  const cards = [
    {
      key: 'win_rate',
      label: 'Team Win Rate',
      icon: '✅',
      iconBg: 'bg-accent-light',
      value: `${team_win_rate.pct}%`,
      valueColor: 'text-accent',
      barWidth: `${team_win_rate.pct}%`,
      barColor: 'var(--color-accent)',
      barSuffix: `${team_win_rate.pct}%`,
      barSuffixColor: 'text-accent',
      subBold: `${team_win_rate.resolved} of ${team_win_rate.total}`,
      sub: ' issues resolved this month',
    },
    {
      key: 'avg_time',
      label: 'Avg. Time to Resolve',
      icon: '⏱',
      iconBg: 'bg-cobalt-light',
      value: avg_time_to_resolve.weeks !== null ? avg_time_to_resolve.weeks.toFixed(1) : '—',
      valueColor: 'text-cobalt',
      barWidth: `${avgWeeksBarPct}%`,
      barColor: 'var(--color-cobalt)',
      barSuffix: 'wks',
      barSuffixColor: 'text-cobalt',
      subBold: 'Target:',
      sub: ` under ${avg_time_to_resolve.target_weeks} weeks`,
    },
    {
      key: 'stalled',
      label: 'AI Stalled Issues',
      icon: '🚨',
      iconBg: 'bg-danger-light',
      value: `${ai_stalled.count}`,
      valueColor: 'text-danger',
      barWidth: `${stalledBarPct}%`,
      barColor: 'var(--color-danger)',
      barSuffix: ai_stalled.flag_label,
      barSuffixColor: 'text-danger',
      subBold: ai_stalled.count > 0 ? 'Need manager' : '',
      sub: ai_stalled.count > 0 ? ' intervention now' : ai_stalled.action_label,
    },
    {
      key: 'in_progress',
      label: 'Issues In Progress',
      icon: '🔄',
      iconBg: 'bg-amber-light',
      value: `${in_progress.count}`,
      valueColor: 'text-amber',
      barWidth: `${inProgressBarPct}%`,
      barColor: 'var(--color-amber)',
      barSuffix: 'active',
      barSuffixColor: 'text-amber',
      subBold: 'Across ',
      sub: `${in_progress.employees_affected} employee${in_progress.employees_affected === 1 ? '' : 's'} this week`,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-[14px]">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px] transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(0,0,0,.07)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.07em]">{card.label}</span>
            <div className={`w-[27px] h-[27px] rounded-[8px] flex items-center justify-center text-[13px] ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          {/* Value */}
          <div className={`text-[30px] font-semibold tracking-[-0.02em] leading-none ${card.valueColor}`}>
            {card.value}
          </div>

          {/* Bar */}
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-[6px] bg-surface-alt rounded-[3px] overflow-hidden">
              <div className="h-full rounded-[3px]" style={{ width: card.barWidth, background: card.barColor }} />
            </div>
            <span className={`font-mono text-[11px] font-medium shrink-0 ${card.barSuffixColor}`}>{card.barSuffix}</span>
          </div>

          {/* Sub */}
          <div className="text-[11.5px] text-muted">
            {card.subBold && <strong className="text-secondary font-medium">{card.subBold}</strong>}
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
