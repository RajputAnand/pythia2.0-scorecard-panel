'use client'

import type { ManagerDashboardCard, ManagerDashboardSummary } from '@/types/manager-dashboard'
import { useAdminConfigStore } from '@/store/adminConfigStore'
import { KPI_IDS } from '@/lib/admin-config-data'

interface Props {
  summary: ManagerDashboardSummary | null
  /** Bypasses the admin visibility filter — used by the Super Admin preview so a card always shows itself regardless of its current toggle state. */
  previewMode?: boolean
  /** Super Admin preview only — dims every card except the one being previewed, so it's obvious which card a given row controls. */
  highlightId?: string
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
  id: string
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

export default function ManagerDashboardKpiStrip({ summary, previewMode, highlightId }: Props) {
  const storeVisibility = useAdminConfigStore((s) => s.visibility)
  const visibility = previewMode ? {} : storeVisibility

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
      id: KPI_IDS.managerKpiGreeted,
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
      id: KPI_IDS.managerKpiValueProposition,
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
      id: KPI_IDS.managerKpiValidated,
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
      id: KPI_IDS.managerKpiThankYou,
      label: 'Thank the Customer',
      icon: '🙏',
      iconBg: 'bg-gold-light',
      valueColor: 'text-gold',
      barColor: 'var(--color-gold)',
      card: thank_you,
      blurb: 'A genuine thank-you at close — use their name, invite them back.',
    },
  ].filter((step) => visibility[step.id] ?? true)

  if (steps.length === 0) return null

  return (
    <div className="grid gap-[14px]" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
      {steps.map((step) => {
        const dimmed = highlightId != null && step.id !== highlightId
        return (
        <div
          key={step.key}
          className={`bg-surface border rounded-[13px] px-5 py-[18px] flex flex-col gap-[10px] transition-all duration-200 ${
            dimmed
              ? 'border-border opacity-35 blur-[1.5px] saturate-50'
              : highlightId != null
                ? 'border-accent ring-2 ring-accent/40 shadow-[0_4px_18px_rgba(0,0,0,.07)]'
                : 'border-border hover:shadow-[0_4px_18px_rgba(0,0,0,.07)]'
          }`}
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
        )
      })}
    </div>
  )
}
