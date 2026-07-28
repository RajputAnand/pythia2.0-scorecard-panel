import styles from './EmployeeSpotlightCard.module.css'
import type { ManagerDashboardEmployeeRow, ManagerDashboardView } from '@/types/manager-dashboard'

interface Props {
  topEmployee: ManagerDashboardEmployeeRow | null
  view: ManagerDashboardView
}

interface ChipProps {
  label: string
  value: string
  valueColor?: string
}

function Chip({ label, value, valueColor }: ChipProps) {
  return (
    <div
      className="flex flex-col rounded-[9px] border gap-[2px] px-[14px] py-[8px]"
      style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)' }}
    >
      <div className="uppercase tracking-[.09em] text-[9px]" style={{ color: 'white', opacity: 0.6 }}>
        {label}
      </div>
      <div className="font-mono font-bold text-[16px]" style={{ color: valueColor ?? '#FFFFFF' }}>
        {value}
      </div>
    </div>
  )
}

export default function EmployeeSpotlightCard({ topEmployee, view }: Props) {
  const periodLabel = view === 'week' ? 'this week' : 'all-time'

  if (!topEmployee || topEmployee.thanked_count === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl px-8 py-6 text-center text-[12.5px] text-muted">
        No employee has been thanked by a customer {periodLabel} yet — the spotlight will light up here once one is.
      </div>
    )
  }

  return (
    <div
      className={`${styles.spotlightPseudo} relative rounded-2xl overflow-hidden grid items-center`}
      style={{
        gridTemplateColumns: 'auto 1fr auto',
        gap: 32,
        padding: '28px 32px',
        background: 'linear-gradient(135deg, #1A1714 0%, #3A2E12 60%, #6B4E12 100%)',
      }}
    >
      {/* Avatar */}
      <div
        className="relative shrink-0 w-[92px] h-[92px] rounded-full flex items-center justify-center text-[26px] font-bold text-white"
        style={{ background: 'rgba(245,200,66,0.18)', border: '2px solid rgba(245,200,66,0.5)' }}
      >
        {topEmployee.initials}
        <span className="absolute -top-1 -right-1 text-[22px]">🏆</span>
      </div>

      {/* Center */}
      <div className="flex flex-col gap-[10px]">
        <div className="uppercase tracking-[.09em] text-[10.5px] font-semibold" style={{ color: '#F5C842' }}>
          Employee Spotlight · {periodLabel}
        </div>
        <div className="font-bold text-white leading-tight text-[20px]">{topEmployee.name}</div>
        <div className="text-white leading-relaxed text-[13px]" style={{ opacity: 0.75 }}>
          {topEmployee.role_title} — leading the team with the most customer thank-yous {periodLabel}.
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <Chip label="Value Prop." value={`${topEmployee.value_prop_rate}%`} valueColor="#F5C842" />
          <Chip label="Greeted" value={`${topEmployee.greeted_rate}%`} valueColor="#FFFFFF" />
          <Chip label="Avg Score" value={`${topEmployee.avg_overall_score}`} valueColor="#78C99A" />
          <Chip label="Transactions" value={`${topEmployee.transaction_count}`} valueColor="#FFFFFF" />
        </div>
      </div>

      {/* Right — headline stat */}
      <div className="flex flex-col items-end gap-[10px]">
        <div
          className="text-center rounded-xl px-[20px] py-[14px]"
          style={{ background: 'rgba(184,134,11,0.25)', border: '1px solid rgba(184,134,11,0.4)' }}
        >
          <div className="font-mono font-bold leading-none text-[32px]" style={{ color: '#F5C842' }}>
            {topEmployee.thanked_count}
          </div>
          <div className="uppercase tracking-[.09em] text-[10px] mt-[4px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Thank Yous
          </div>
        </div>
        <div className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          {topEmployee.thanked_rate}% of transactions
        </div>
      </div>
    </div>
  )
}
