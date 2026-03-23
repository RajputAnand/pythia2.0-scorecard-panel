import styles from './ProjectionSummary.module.css'

const STATS = [
  {
    eyebrow: 'If current trajectory holds',
    value: '+$25,200',
    highlight: true,
    sub: <>Projected net revenue impact over next <strong>4 months</strong></>,
  },
  {
    eyebrow: 'If team score reaches 88',
    value: '+$34,800',
    highlight: true,
    sub: <>Estimated impact if <strong>all 5 stalled issues resolve</strong></>,
  },
  {
    eyebrow: 'Breakeven on platform',
    value: '3.2 days',
    highlight: false,
    sub: <>Platform pays for itself in under <strong>4 days of operation</strong></>,
  },
  {
    eyebrow: 'Annual ROI projection',
    value: '15.4×',
    highlight: true,
    sub: <>Based on current improvement rate <strong>sustained 12 months</strong></>,
  },
]

export default function ProjectionSummary() {
  return (
    <div className={styles.projSummary}>
      {STATS.map((stat) => (
        <div key={stat.eyebrow} className={styles.stat}>
          <div className={styles.eyebrow}>{stat.eyebrow}</div>
          <div className={`${styles.value} ${stat.highlight ? styles.highlight : ''}`}>{stat.value}</div>
          <div className={styles.sub}>{stat.sub}</div>
        </div>
      ))}
      <div className={styles.assumption}>
        * Projections assume current score improvement rate of +1.5 pts/month continues. Revenue
        correlations based on 4 months of observed store data. Basket size assumption: $8.40 avg.
        These are estimates, not guarantees.
      </div>
    </div>
  )
}
