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
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>Estimated Revenue Impact by Metric</div>
          <div className={styles.cardSub}>Actuals Nov–Feb · Projections based on current trajectory</div>
        </div>
        <div className={`${styles.badge} ${styles.neutral}`}>4-month view</div>
      </div>
      <div className={styles.tableWrap}>
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
                  <div className={styles.metricName}>{row.metric}</div>
                  <div className={styles.metricSub}>{row.sub}</div>
                </td>
                <td>
                  <div className={styles.scoreChange}>
                    <span className={styles.scoreBefore}>{row.scoreBefore}</span>
                    <span className={styles.scoreArrow}>→</span>
                    <span className={styles.scoreAfter} style={{ color: row.scoreColor }}>{row.scoreAfter}</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: row.barWidth, background: row.barColor }} />
                  </div>
                </td>
                <td className={styles.outcomeCell}>{row.outcome}</td>
                <td>
                  <span className={`${styles.revenue} ${styles.actual}`}>{row.actual}</span>
                  <span className={`${styles.projBadge} ${styles.actualBadge}`}>Actual</span>
                </td>
                <td>
                  <span className={`${styles.revenue} ${styles.projected}`}>{row.projected}</span>
                  <span className={`${styles.projBadge} ${styles.projBadgeBlue}`}>Proj</span>
                </td>
              </tr>
            ))}

            {/* Cost row */}
            <tr className={styles.costRow}>
              <td>
                <div className={`${styles.metricName} ${styles.costMetric}`}>Pythia Platform Cost</div>
                <div className={styles.metricSub}>All-in monthly subscription</div>
              </td>
              <td>—</td>
              <td className={styles.outcomeCell}>Coaching, analytics, hardware</td>
              <td>
                <span className={`${styles.revenue} ${styles.cost}`}>−$1,440</span>
                <span className={`${styles.projBadge} ${styles.costBadge}`}>Cost</span>
              </td>
              <td>
                <span className={`${styles.revenue} ${styles.cost}`}>−$1,440</span>
                <span className={`${styles.projBadge} ${styles.costBadge}`}>Cost</span>
              </td>
            </tr>

            {/* Net ROI row */}
            <tr className={styles.roiRow}>
              <td>
                <div className={styles.roiLabel}>Net ROI</div>
              </td>
              <td>—</td>
              <td className={styles.roiOutcome}>12.7× return on platform investment</td>
              <td>
                <span className={`${styles.revenue} ${styles.actual} ${styles.revenueLg}`}>+$16,800</span>
              </td>
              <td>
                <span className={`${styles.revenue} ${styles.projected} ${styles.revenueLg}`}>+$23,760</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
