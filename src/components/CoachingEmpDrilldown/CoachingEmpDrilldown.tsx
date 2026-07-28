import type { CoachingEmployeeChip, CoachingEmployeeDetail, CoachingIssueStatus } from '@/types/coaching-plan'
import { getAvatarColor, getInitialsFromDisplayName } from '@/utils/common'

interface Props {
  employee: CoachingEmployeeChip
  detail: CoachingEmployeeDetail
}

type StatColor = 'good' | 'ok' | 'bad' | 'neutral'

const statColorMap: Record<StatColor, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
  neutral: 'text-cobalt',
}

const statusDotColor: Record<CoachingIssueStatus, string> = {
  resolved: 'var(--color-accent)',
  in_progress: 'var(--color-amber)',
  stalled: 'var(--color-danger)',
}

const statusLabelClass: Record<CoachingIssueStatus, string> = {
  resolved: 'text-accent',
  in_progress: 'text-amber',
  stalled: 'text-danger',
}

const statusLabel: Record<CoachingIssueStatus, string> = {
  resolved: 'Resolved',
  in_progress: 'In Progress',
  stalled: 'Stalled',
}

// Rotating pill palette for category labels — the backend doesn't constrain
// category to a fixed small set, so color is a stable hash of the string
// rather than a lookup table that would need updating for every new category.
const CATEGORY_PALETTE = [
  'bg-accent-light text-accent',
  'bg-amber-light text-amber',
  'bg-cobalt-light text-cobalt',
  'bg-purple-light text-purple',
]

function categoryPillClass(category: string): string {
  let hash = 0
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length]
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(/[\s_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function winRateBand(pct: number): StatColor {
  if (pct >= 70) return 'good'
  if (pct >= 40) return 'ok'
  return 'bad'
}

function avgWeeksBand(weeks: number | null): StatColor {
  if (weeks === null) return 'neutral'
  if (weeks <= 3) return 'neutral'
  if (weeks <= 5) return 'ok'
  return 'bad'
}

function stalledBand(count: number): StatColor {
  if (count === 0) return 'good'
  if (count === 1) return 'ok'
  return 'bad'
}

function effectivenessFillColor(pct: number): string {
  if (pct >= 70) return 'var(--color-accent)'
  if (pct >= 40) return 'var(--color-amber)'
  return 'var(--color-danger)'
}

export default function CoachingEmpDrilldown({ employee, detail }: Props) {
  const { summary, signals, categories } = detail

  const winRate = summary.team_win_rate.pct
  const avgWks = summary.avg_time_to_resolve.weeks
  const stalledCount = summary.ai_stalled.count

  const resolvedCount = signals.filter((s) => s.status === 'resolved').length
  const inProgressCount = signals.filter((s) => s.status === 'in_progress').length
  const initials = getInitialsFromDisplayName(employee.name)
  const avatarColor = getAvatarColor(employee.user_id)

  const meta =
    `${signals.length} issue${signals.length === 1 ? '' : 's'} tracked · ${resolvedCount} resolved · ` +
    `${inProgressCount} in progress · ${stalledCount} stalled${stalledCount > 0 ? ' 🚨' : ''}`

  // Circle geometry for r=32: circumference = 2πr ≈ 201.06.
  const circumference = 2 * Math.PI * 32
  const circleDasharray = circumference.toFixed(1)
  const circleDashoffset = (circumference * (1 - winRate / 100)).toFixed(1)
  const circleValueColor = effectivenessFillColor(winRate)

  return (
    <div className="flex flex-col">
      {/* Employee Summary Bar */}
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border bg-surface-alt">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0 rounded-full text-white font-bold w-10 h-10 text-[13px]"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <div>
            <div className="text-[14px] font-semibold">
              {employee.name} — {employee.role_title}
            </div>
            <div className="text-[11.5px] text-muted mt-px">{meta}</div>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col gap-0.5 items-end">
            <div className={`font-mono text-[18px] font-semibold leading-none ${statColorMap[winRateBand(winRate)]}`}>
              {winRate}%
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[.07em]">Win Rate</div>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <div className={`font-mono text-[18px] font-semibold leading-none ${statColorMap[avgWeeksBand(avgWks)]}`}>
              {avgWks !== null ? avgWks.toFixed(1) : '—'}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[.07em]">Avg Wks</div>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <div className={`font-mono text-[18px] font-semibold leading-none ${statColorMap[stalledBand(stalledCount)]}`}>
              {stalledCount}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[.07em]">Stalled</div>
          </div>
        </div>
      </div>

      {/* Issue Table */}
      <div className="px-[22px] py-[18px] overflow-x-auto">
        {signals.length === 0 ? (
          <div className="text-[12.5px] text-muted py-6 text-center">No coaching issues tracked for this employee.</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-[10px] font-semibold text-muted uppercase tracking-[.09em] text-left px-3 pb-[10px] border-b border-border first:pl-0 w-[110px]">
                  Category
                </th>
                <th className="text-[10px] font-semibold text-muted uppercase tracking-[.09em] text-left px-3 pb-[10px] border-b border-border">
                  Issue Flagged
                </th>
                <th className="text-[10px] font-semibold text-muted uppercase tracking-[.09em] text-left px-3 pb-[10px] border-b border-border w-[140px]">
                  Score Change
                </th>
                <th className="text-[10px] font-semibold text-muted uppercase tracking-[.09em] text-left px-3 pb-[10px] border-b border-border w-[100px]">
                  Weeks
                </th>
                <th className="text-[10px] font-semibold text-muted uppercase tracking-[.09em] text-left px-3 pb-[10px] border-b border-border w-[110px]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {signals.map((issue) => {
                const delta = issue.score_delta
                const deltaType = delta === null ? 'flat' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
                const deltaColorClass = { up: 'text-accent', down: 'text-danger', flat: 'text-muted' }[deltaType]
                const deltaBgClass = {
                  up: 'bg-accent-light text-accent',
                  down: 'bg-danger-light text-danger',
                  flat: 'bg-surface-alt text-muted',
                }[deltaType]

                return (
                  <tr key={issue.signal_id} className={issue.status === 'stalled' ? 'bg-[#FDF8F8]' : ''}>
                    <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle first:pl-0 last-of-type:border-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-[3px] rounded-[5px] whitespace-nowrap ${categoryPillClass(issue.category)}`}
                      >
                        {titleCase(issue.category)}
                      </span>
                    </td>
                    <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                      <div className="text-[12.5px] font-medium text-primary leading-[1.35]">
                        {issue.issue_title}
                        {issue.status === 'stalled' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-danger bg-danger-light px-[6px] py-[2px] rounded ml-1.5">
                            🚨 Stalled
                          </span>
                        )}
                      </div>
                      {issue.coach_quote && (
                        <div className="text-[11.5px] text-secondary mt-0.5 italic">{issue.coach_quote}</div>
                      )}
                    </td>
                    <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                      {issue.first_score !== null && issue.current_score !== null ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] text-muted">{issue.first_score}</span>
                          <span className="text-[12px] text-muted">→</span>
                          <span className={`font-mono text-[13px] font-bold ${deltaColorClass}`}>{issue.current_score}</span>
                          {delta !== null && (
                            <span className={`text-[10.5px] font-semibold px-[5px] py-px rounded font-mono ${deltaBgClass}`}>
                              {delta > 0 ? '+' : ''}
                              {delta}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="font-mono text-[13px] text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                      <div className="font-mono text-[12px] text-secondary">
                        {issue.weeks_tracked !== null ? `${issue.weeks_tracked.toFixed(1)} wks` : '—'}
                      </div>
                    </td>
                    <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                      <div className="flex items-center gap-1.5">
                        <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: statusDotColor[issue.status] }} />
                        <span className={`text-[12px] font-medium ${statusLabelClass[issue.status]}`}>
                          {statusLabel[issue.status]}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Effectiveness Chart Row */}
      <div className="flex gap-4 items-start px-[22px] py-4 border-t border-border">
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-secondary uppercase tracking-[.08em] mb-3">
            Coaching type effectiveness — {employee.name.split(' ')[0]}
          </div>
          <div className="flex flex-col gap-[9px]">
            {categories.length === 0 ? (
              <div className="text-[11.5px] text-muted">No categories tracked yet.</div>
            ) : (
              categories.map((cat) => (
                <div key={cat.category} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-medium text-secondary">{titleCase(cat.category)} coaching</span>
                    <span className="font-mono text-[11px] text-muted">
                      {cat.total === 0 ? 'No data' : `${cat.resolved_pct}% resolved`}
                    </span>
                  </div>
                  <div className="h-[7px] bg-surface-alt rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{ width: `${cat.resolved_pct}%`, background: effectivenessFillColor(cat.resolved_pct) }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Win Rate Circle */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#F0EDE8" strokeWidth="7" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={circleValueColor}
              strokeWidth="7"
              strokeDasharray={circleDasharray}
              strokeDashoffset={circleDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="font-mono text-[22px] font-semibold" style={{ color: circleValueColor }}>
            {winRate}%
          </div>
          <div className="text-[10px] text-muted uppercase tracking-[.08em] text-center">Win Rate</div>
        </div>
      </div>
    </div>
  )
}
