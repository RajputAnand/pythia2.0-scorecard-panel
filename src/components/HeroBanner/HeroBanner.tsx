import styles from './HeroBanner.module.css'

interface MetricProps {
  label: string
  value: string
  change: string
  valueClass?: string
}

function Metric({ label, value, change, valueClass }: MetricProps) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={`${styles.metricVal} ${valueClass ?? ''}`}>{value}</div>
      <div className={styles.metricChange}>{change}</div>
    </div>
  )
}

export default function HeroBanner() {
  return (
    <div className={styles.banner}>
      {/* Score ring */}
      <div className={styles.scoreRing}>
        <svg viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)', width: 110, height: 110 }}>
          <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="55" cy="55" r="46"
            fill="none" stroke="#78C99A" strokeWidth="8"
            strokeDasharray="289" strokeDashoffset="52"
            strokeLinecap="round"
          />
        </svg>
        <div className={styles.scoreRingCenter}>
          <div className={styles.scoreNum}>84</div>
          <div className={styles.scoreLabel}>Score</div>
        </div>
      </div>

      {/* Center */}
      <div className={styles.center}>
        <div className={styles.greeting}>
          Good morning, <span className={styles.greetingAccent}>Marcus.</span>
          <br />You&apos;re on a 3-week improvement streak. 🔥
        </div>
        <div className={styles.sub}>
          Your score is up 6 points since November. You&apos;re in the top 25% of your team this week.
        </div>
        <div className={styles.metricRow}>
          <Metric label="Hospitality" value="88" change="↑ +4 this week" valueClass={styles.metricValGreen} />
          <Metric label="Checkout Spd" value="76" change="→ Coaching active" valueClass={styles.metricValAmber} />
          <Metric label="Time to Svc" value="86" change="↑ +2 this week" valueClass={styles.metricValGreen} />
          <Metric label="Shift Hours" value="36h" change="This week" />
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        <div className={styles.pointsBadge}>
          <div className={styles.pointsVal}>1,840</div>
          <div className={styles.pointsLabel}>Points</div>
        </div>
        <div className={styles.rankBadge}>
          <div className={styles.rankVal}>#2 / 5</div>
          <div className={styles.rankLabel}>Team rank</div>
        </div>
      </div>
    </div>
  )
}
