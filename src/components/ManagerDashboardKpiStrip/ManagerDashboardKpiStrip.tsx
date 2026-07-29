import type { ManagerDashboardCard, ManagerDashboardSummary } from '@/types/manager-dashboard'

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

interface StepCard {
  key: string
  label: string
  icon: string
  iconBg: string
  valueColor: string
  barColor: string
  card: ManagerDashboardCard
  blurb: string
}

// Falls back to this when the API response is missing a card (e.g. an older
// backend deploy that predates the "validated" field) so a partial/stale
// response degrades to "not yet tracked" instead of crashing the page.
const FALLBACK_CARD: ManagerDashboardCard = { count: 0, rate: 0, tracked: false }

export default function ManagerDashboardKpiStrip({ summary }: Props) {
  if (!summary) return <KpiStripSkeleton />

  const {
    greeted_on_time = FALLBACK_CARD,
    value_proposition = FALLBACK_CARD,
    validated = FALLBACK_CARD,
    thank_you = FALLBACK_CARD,
  } = summary

  // The 4-step coaching checklist — each step is worth +25 pts/visit
  // (calc_step_points), so all 4 cards together always sum to 100 pts.
  const steps: StepCard[] = [
    {
      key: 'greeted',
      label: 'Greet Every Customer',
      icon: '👋',
      iconBg: 'bg-accent-light',
      valueColor: 'text-accent',
      barColor: 'var(--color-accent)',
      card: greeted_on_time,
      blurb: 'Eye contact, a smile, a warm welcome — within 10 seconds of arrival.',
    },
    {
      key: 'value_proposition',
      label: 'Add a Value Proposition',
      icon: '💡',
      iconBg: 'bg-cobalt-light',
      valueColor: 'text-cobalt',
      barColor: 'var(--color-cobalt)',
      card: value_proposition,
      blurb: 'Suggestive selling or a rewards-card ask, right after the greeting.',
    },
    {
      key: 'validated',
      label: 'Validate the Purchase',
      icon: '🙌',
      iconBg: 'bg-amber-light',
      valueColor: 'text-amber',
      barColor: 'var(--color-amber)',
      card: validated,
      blurb: 'A genuine personal comment that makes the customer feel great about it.',
    },
    {
      key: 'thanked',
      label: 'Thank the Customer',
      icon: '🙏',
      iconBg: 'bg-gold-light',
      valueColor: 'text-gold',
      barColor: 'var(--color-gold)',
      card: thank_you,
      blurb: 'A genuine thank-you at close — use their name, invite them back.',
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-[14px]">
      {steps.map((step) => (
        <div
          key={step.key}
          className="bg-surface border border-border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px] transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(0,0,0,.07)]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10.5px] font-medium text-muted uppercase tracking-[.06em] leading-tight">
              {step.label}
            </span>
            <div className={`w-[27px] h-[27px] rounded-[8px] flex items-center justify-center text-[13px] shrink-0 ${step.iconBg}`}>
              {step.icon}
            </div>
          </div>

          {step.card.tracked ? (
            <>
              <div className={`text-[30px] font-semibold tracking-[-0.02em] leading-none ${step.valueColor}`}>
                {step.card.rate}%
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-[6px] bg-surface-alt rounded-[3px] overflow-hidden">
                  <div className="h-full rounded-[3px]" style={{ width: `${step.card.rate}%`, background: step.barColor }} />
                </div>
                <span className={`font-mono text-[11px] font-medium shrink-0 ${step.valueColor}`}>{step.card.count}</span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[30px] font-semibold tracking-[-0.02em] leading-none text-muted">—</div>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-[6px] bg-surface-alt rounded-[3px] overflow-hidden" />
                <span className="font-mono text-[11px] font-medium shrink-0 text-muted">n/a</span>
              </div>
            </>
          )}

          <div className="text-[11.5px] text-muted leading-snug">
            <strong className={`font-mono font-semibold ${step.valueColor}`}>+25 pts</strong> / visit
            {!step.card.tracked && <span className="italic"> · tracking coming soon</span>}
            <div className="mt-[3px] text-[10.5px] opacity-80">{step.blurb}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
