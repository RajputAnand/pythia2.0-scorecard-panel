import Panel from '@/components/Panel/Panel'
import styles from './ShiftSummary.module.css'

const METRICS = [
  { label: 'Overall Score', value: '87', change: '↑ +3 vs. your avg', changeClass: 'up', valueClass: 'good' },
  { label: 'Customers Served', value: '142', change: '↑ +12 vs. avg shift', changeClass: 'up', valueClass: 'great' },
  { label: 'Avg Checkout', value: '31s', change: '→ Target is 25s', changeClass: 'flat', valueClass: 'ok' },
  { label: 'Points Earned', value: '+124', change: '↑ Best shift this week', changeClass: 'up', valueClass: 'gold' },
]

const TIMELINE = [
  {
    time: '11:04',
    dotColor: 'var(--color-accent)',
    scoreColor: 'var(--color-accent)',
    score: '92',
    text: (
      <><strong>Strong start</strong> — greeted first 8 customers within 2s. Hospitality score 92 in opening hour.</>
    ),
  },
  {
    time: '12:40',
    dotColor: 'var(--color-amber)',
    scoreColor: 'var(--color-amber)',
    score: '74',
    text: (
      <>Lunch rush — checkout slowed to <strong>38s avg</strong> under volume. Expected; score dipped temporarily.</>
    ),
  },
  {
    time: '2:15',
    dotColor: 'var(--color-accent)',
    scoreColor: 'var(--color-accent)',
    score: '89',
    text: (
      <>Recovered well after rush — <strong>back to 29s checkout</strong>. Mid-afternoon consistency was your best window today.</>
    ),
  },
  {
    time: '6:30',
    dotColor: 'var(--color-cobalt)',
    scoreColor: 'var(--color-cobalt)',
    score: '86',
    text: (
      <><strong>Evening close strong</strong> — time-to-service 86 for the final hour. Engagement held up well at end of shift.</>
    ),
  },
]

const badge = (
  <span className={styles.badge}>Shift complete</span>
)

export default function ShiftSummary() {
  return (
    <Panel
      title="Today's Shift Summary"
      subtitle="Wed Feb 25 · 11a – 7p · 8 hours"
      badge={badge}
    >
      <div className={styles.metricGrid}>
        {METRICS.map((m) => (
          <div key={m.label} className={styles.metric}>
            <div className={styles.metricLabel}>{m.label}</div>
            <div className={`${styles.metricVal} ${styles[m.valueClass]}`}>{m.value}</div>
            <div className={`${styles.metricChange} ${styles[m.changeClass]}`}>{m.change}</div>
          </div>
        ))}
      </div>

      <div className={styles.timeline}>
        {TIMELINE.map((event) => (
          <div key={event.time} className={styles.event}>
            <div className={styles.eventTime}>{event.time}</div>
            <div className={styles.eventDot} style={{ background: event.dotColor }} />
            <div className={styles.eventText}>{event.text}</div>
            <div className={styles.eventScore} style={{ color: event.scoreColor }}>{event.score}</div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
