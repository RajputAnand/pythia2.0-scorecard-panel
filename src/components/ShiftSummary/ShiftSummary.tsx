import Panel from '@/components/Panel/Panel'
import styles from './ShiftSummary.module.css'

const metricValClass: Record<string, string> = {
  good: 'text-accent',
  great: 'text-accent',
  ok: 'text-amber',
  gold: 'text-[var(--color-gold)]',
}

const metricChangeClass: Record<string, string> = {
  up: 'text-accent',
  down: 'text-danger',
  flat: 'text-muted',
}

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
  <span className="bg-accent-light text-accent font-semibold rounded-[20px] text-[11px] px-[9px] py-[3px]">
    Shift complete
  </span>
)

export default function ShiftSummary() {
  return (
    <Panel
      title="Today's Shift Summary"
      subtitle="Wed Feb 25 · 11a – 7p · 8 hours"
      badge={badge}
    >
      <div className="grid gap-[10px]" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {METRICS.map((m) => (
          <div key={m.label} className="flex flex-col bg-surface-alt rounded-[10px] px-[15px] py-[13px] gap-1">
            <div className="uppercase tracking-[.08em] text-muted text-[10px]">{m.label}</div>
            <div className={`font-mono font-bold leading-none text-[22px] ${metricValClass[m.valueClass]}`}>
              {m.value}
            </div>
            <div className={`font-semibold text-[11px] ${metricChangeClass[m.changeClass]}`}>
              {m.change}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col border border-border rounded-[10px] overflow-hidden mt-[14px]">
        {TIMELINE.map((event) => (
          <div key={event.time} className={`flex items-start gap-[10px] border-b border-border px-[14px] py-[10px] last:border-b-0`}>
            <div className="font-mono text-muted shrink-0 text-[10.5px] w-[38px] mt-px">{event.time}</div>
            <div
              className="rounded-full shrink-0 w-2 h-2 mt-1"
              style={{ background: event.dotColor }}
            />
            <div className={`${styles.eventText} text-secondary leading-snug flex-1 text-[12px]`}>
              {event.text}
            </div>
            <div className="font-mono font-bold shrink-0 text-[12px]" style={{ color: event.scoreColor }}>
              {event.score}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}
