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
    <div
      className={`${styles.projSummary} relative rounded-2xl overflow-hidden grid gap-6`}
      style={{
        background: 'var(--color-cobalt)',
        padding: '22px 28px',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
      }}
    >
      {STATS.map((stat) => (
        <div key={stat.eyebrow} className="flex flex-col gap-[5px]">
          <div
            className="font-medium uppercase text-[9.5px]"
            style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '.1em' }}
          >
            {stat.eyebrow}
          </div>
          <div
            className="font-mono font-medium text-[26px] leading-none"
            style={{ color: stat.highlight ? '#A8DFCA' : 'white' }}
          >
            {stat.value}
          </div>
          <div
            className="text-[11px] leading-[1.4] [&_strong]:text-white/75"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            {stat.sub}
          </div>
        </div>
      ))}
      <div
        className="col-span-4 text-[10.5px] italic mt-[10px]"
        style={{ color: 'rgba(255,255,255,0.3)' }}
      >
        * Projections assume current score improvement rate of +1.5 pts/month continues. Revenue
        correlations based on 4 months of observed store data. Basket size assumption: $8.40 avg.
        These are estimates, not guarantees.
      </div>
    </div>
  )
}
