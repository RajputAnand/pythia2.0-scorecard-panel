import styles from './RevenueImpactTable.module.css'

const ROWS = [
  {
    metric: 'Team Hospitality Score',
    sub: 'Greeting rate, tone, engagement',
    scoreBefore: '71', scoreAfter: '84', scoreColor: '#1D5C3A',
    barWidth: '84%', barColor: '#1D5C3A',
    outcome: '+46s avg dwell time · +2.3% basket',
    actual: '+$6,840', projected: '+$9,200',
  },
  {
    metric: 'Checkout Speed',
    sub: 'Avg transaction time per customer',
    scoreBefore: '38s', scoreAfter: '29s', scoreColor: '#C47F18',
    barWidth: '70%', barColor: '#C47F18',
    outcome: '+15 customers/hr · less abandonment',
    actual: '+$8,400', projected: '+$11,200',
  },
  {
    metric: 'Time to Service',
    sub: 'Greeting delay reduction',
    scoreBefore: '75', scoreAfter: '82', scoreColor: '#1E4D7A',
    barWidth: '82%', barColor: '#1E4D7A',
    outcome: '+8% repeat visit intent (survey)',
    actual: '+$3,000', projected: '+$4,800',
  },
]

export default function RevenueImpactTable() {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between border-b border-border px-5 pt-4 pb-3">
        <div>
          <div className="font-semibold text-[13px]">Estimated Revenue Impact by Metric</div>
          <div className="text-muted text-[11px] mt-0.5">Actuals Nov–Feb · Projections based on current trajectory</div>
        </div>
        <div className="font-bold rounded-[20px] whitespace-nowrap bg-surface-alt text-muted text-[10px] px-[8px] py-[3px]">
          4-month view
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Metric Improved</th>
              <th>Score Change</th>
              <th>Business Outcome</th>
              <th>Actual Impact</th>
              <th>Projected (next 4 mo)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.metric}>
                <td>
                  <div className="font-medium text-[13px]">{row.metric}</div>
                  <div className="text-muted text-[11px]">{row.sub}</div>
                </td>
                <td>
                  <div className="flex items-center gap-[6px]">
                    <span className="font-mono text-muted text-[12px]">{row.scoreBefore}</span>
                    <span className="text-muted text-[11px]">→</span>
                    <span className="font-mono font-bold text-[12px]" style={{ color: row.scoreColor }}>{row.scoreAfter}</span>
                  </div>
                  <div className="bg-surface-alt rounded-[3px] overflow-hidden h-[6px] mt-[5px]">
                    <div className="h-full rounded-[3px]" style={{ width: row.barWidth, background: row.barColor }} />
                  </div>
                </td>
                <td className="text-secondary text-[12px]">{row.outcome}</td>
                <td>
                  <span className="font-mono font-bold text-[13px] text-accent">{row.actual}</span>
                  <span className="font-semibold rounded-[4px] bg-accent-light text-accent text-[9.5px] px-[5px] py-[1px] ml-1">Actual</span>
                </td>
                <td>
                  <span className="font-mono font-bold text-[13px] text-cobalt">{row.projected}</span>
                  <span className="font-semibold rounded-[4px] bg-cobalt-light text-cobalt text-[9.5px] px-[5px] py-[1px] ml-1">Proj</span>
                </td>
              </tr>
            ))}

            {/* Cost row */}
            <tr style={{ background: '#FAFAF8' }}>
              <td>
                <div className="font-medium text-[13px] text-amber">Pythia Platform Cost</div>
                <div className="text-muted text-[11px]">All-in monthly subscription</div>
              </td>
              <td>—</td>
              <td className="text-secondary text-[12px]">Coaching, analytics, hardware</td>
              <td>
                <span className="font-mono font-bold text-[13px] text-amber">−$1,440</span>
                <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-[1px] ml-1">Cost</span>
              </td>
              <td>
                <span className="font-mono font-bold text-[13px] text-amber">−$1,440</span>
                <span className="font-semibold rounded-[4px] bg-amber-light text-amber text-[9.5px] px-[5px] py-[1px] ml-1">Cost</span>
              </td>
            </tr>

            {/* Net ROI row */}
            <tr style={{ background: 'var(--color-accent-light)' }}>
              <td>
                <div className="text-accent font-medium text-[14px]">Net ROI</div>
              </td>
              <td>—</td>
              <td className="text-accent font-medium text-[12px]">12.7× return on platform investment</td>
              <td>
                <span className="font-mono font-bold text-[15px] text-accent">+$16,800</span>
              </td>
              <td>
                <span className="font-mono font-bold text-[15px] text-cobalt">+$23,760</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
