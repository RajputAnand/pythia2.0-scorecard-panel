import type { Employee  } from '@/types/employee'

interface Props {
  employee: Employee
}

const statColorMap: Record<string, string> = {
  good: 'text-accent',
  ok: 'text-amber',
  bad: 'text-danger',
  neutral: 'text-cobalt',
}

export default function CoachingEmpDrilldown({ employee }: Props) {
  const categoryLabelMap: Record<string, string> = {
    hospitality: 'Hospitality',
    checkout: 'Checkout',
    time: 'Time to Svc',
    tone: 'Tone',
  }

  const categoryPillClass: Record<string, string> = {
    hospitality: 'bg-accent-light text-accent',
    checkout: 'bg-amber-light text-amber',
    time: 'bg-cobalt-light text-cobalt',
    tone: 'bg-purple-light text-purple',
  }

  const statusDotColor: Record<string, string> = {
    resolved: 'var(--color-accent)',
    progress: 'var(--color-amber)',
    stalled: 'var(--color-danger)',
  }

  const statusLabelClass: Record<string, string> = {
    resolved: 'text-accent',
    progress: 'text-amber',
    stalled: 'text-danger',
  }

  const statusLabel: Record<string, string> = {
    resolved: 'Resolved',
    progress: 'In Progress',
    stalled: 'Stalled',
  }

  const pipBgClass: Record<string, string> = {
    'filled-green': 'bg-accent',
    'filled-amber': 'bg-amber',
    'filled-red': 'bg-danger',
    empty: 'bg-border',
  }

  const deltaColorClass: Record<string, string> = {
    up: 'text-accent',
    down: 'text-danger',
    flat: 'text-muted',
  }

  const deltaBgClass: Record<string, string> = {
    up: 'bg-accent-light text-accent',
    down: 'bg-danger-light text-danger',
    flat: 'bg-surface-alt text-muted',
  }

  return (
    <div className="flex flex-col">
      {/* Employee Summary Bar */}
      <div className="flex items-center justify-between px-[22px] py-4 border-b border-border bg-surface-alt">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center shrink-0 rounded-full text-white font-bold w-10 h-10 text-[13px]"
            style={{ background: employee.avatarColor }}
          >
            {employee.initials}
          </div>
          <div>
            <div className="text-[14px] font-semibold">
              {employee.name} — {employee.title}
            </div>
            <div className="text-[11.5px] text-muted mt-px">{employee.meta}</div>
          </div>
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col gap-0.5 items-end">
            <div className={`font-mono text-[18px] font-semibold leading-none ${statColorMap[employee.winRateColor]}`}>
              {employee.winRate}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[.07em]">Win Rate</div>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <div className={`font-mono text-[18px] font-semibold leading-none ${statColorMap[employee.avgWksColor]}`}>
              {employee.avgWks}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[.07em]">Avg Wks</div>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <div className={`font-mono text-[18px] font-semibold leading-none ${statColorMap[employee.stalledColor]}`}>
              {employee.stalledCount}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-[.07em]">Stalled</div>
          </div>
        </div>
      </div>

      {/* Issue Table */}
      <div className="px-[22px] py-[18px] overflow-x-auto">
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
            {employee.issues.map((issue) => (
              <tr
                key={issue.id}
                className={issue.stalled ? 'bg-[#FDF8F8]' : ''}
              >
                <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle first:pl-0 last-of-type:border-0">
                  <span
                    className={`text-[10px] font-semibold px-2 py-[3px] rounded-[5px] whitespace-nowrap ${categoryPillClass[issue.category]}`}
                  >
                    {categoryLabelMap[issue.category]}
                  </span>
                </td>
                <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                  <div className="text-[12.5px] font-medium text-primary leading-[1.35]">
                    {issue.description}
                    {issue.stalled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-danger bg-danger-light px-[6px] py-[2px] rounded ml-1.5">
                        🚨 Stalled
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-secondary mt-0.5 italic">{issue.coaching}</div>
                </td>
                <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-muted">{issue.scoreBefore}</span>
                    <span className="text-[12px] text-muted">→</span>
                    <span className={`font-mono text-[13px] font-bold ${deltaColorClass[issue.scoreDeltaType]}`}>
                      {issue.scoreAfter}
                    </span>
                    <span className={`text-[10.5px] font-semibold px-[5px] py-px rounded font-mono ${deltaBgClass[issue.scoreDeltaType]}`}>
                      {issue.scoreDelta > 0 ? '+' : ''}{issue.scoreDelta}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                  <div className="font-mono text-[12px] text-secondary">{issue.weeksLabel}</div>
                  <div className="flex gap-[3px] mt-[3px]">
                    {issue.pips.map((pip, i) => (
                      <div
                        key={i}
                        className={`w-[10px] h-[4px] rounded-[2px] ${pipBgClass[pip]}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-[13px] text-[12.5px] border-b border-border align-middle">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-[7px] h-[7px] rounded-full shrink-0"
                      style={{ background: statusDotColor[issue.status] }}
                    />
                    <span className={`text-[12px] font-medium ${statusLabelClass[issue.status]}`}>
                      {statusLabel[issue.status]}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Effectiveness Chart Row */}
      <div className="flex gap-4 items-start px-[22px] py-4 border-t border-border">
        <div className="flex-1">
          <div className="text-[11px] font-semibold text-secondary uppercase tracking-[.08em] mb-3">
            Coaching type effectiveness — {employee.name.split(' ')[0]}
          </div>
          <div className="flex flex-col gap-[9px]">
            {employee.effBars.map((bar, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-medium text-secondary">{bar.label}</span>
                  <span className="font-mono text-[11px] text-muted">{bar.pct}</span>
                </div>
                <div className="h-[7px] bg-surface-alt rounded overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: bar.fillWidth, background: bar.fillColor }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate Circle */}
        <div className="flex flex-col items-center gap-2 min-w-[100px]">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#F0EDE8" strokeWidth="7" />
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke={employee.circleStroke}
              strokeWidth="7"
              strokeDasharray={employee.circleDasharray}
              strokeDashoffset={employee.circleDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div
            className="font-mono text-[22px] font-semibold"
            style={{ color: employee.circleValueColor ?? 'var(--color-accent)' }}
          >
            {employee.winRate}
          </div>
          <div className="text-[10px] text-muted uppercase tracking-[.08em] text-center">Win Rate</div>
        </div>
      </div>
    </div>
  )
}
