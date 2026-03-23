import styles from './ScoreVsTransactions.module.css'

export default function ScoreVsTransactions() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <div className={styles.cardTitle}>Team Score vs. Monthly Transactions</div>
          <div className={styles.cardSub}>Monthly · Node 1 + Node 2 combined</div>
        </div>
        <div className={`${styles.badge} ${styles.positive}`}>r = 0.94 correlation</div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: '#1D5C3A' }} />
            Team score
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: '#1E4D7A' }} />
            Transactions/mo
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: 'repeating-linear-gradient(90deg,#1D5C3A 0,#1D5C3A 4px,transparent 4px,transparent 8px)' }} />
            Projected
          </div>
        </div>
        <div className={styles.svgWrap}>
          <svg viewBox="0 0 460 140" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="460" y2="20" stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="0" y1="50" x2="460" y2="50" stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="0" y1="80" x2="460" y2="80" stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="0" y1="110" x2="460" y2="110" stroke="#F0EDE8" strokeWidth="1"/>
            <line x1="345" y1="0" x2="345" y2="140" stroke="#E4DFD8" strokeWidth="1" strokeDasharray="4,3"/>
            <text x="350" y="12" fontSize="8" fill="#B0A89E" fontFamily="DM Mono">Projected →</text>
            {/* Score line (green) */}
            <path d="M 20 105 L 135 95 L 250 80 L 345 62" fill="none" stroke="#1D5C3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 345 62 L 440 48" fill="none" stroke="#1D5C3A" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"/>
            <circle cx="20" cy="105" r="4" fill="#1D5C3A"/>
            <circle cx="135" cy="95" r="4" fill="#1D5C3A"/>
            <circle cx="250" cy="80" r="4" fill="#1D5C3A"/>
            <circle cx="345" cy="62" r="4" fill="#1D5C3A"/>
            <circle cx="440" cy="48" r="4" fill="white" stroke="#1D5C3A" strokeWidth="2"/>
            {/* Transaction line (blue) */}
            <path d="M 20 108 L 135 97 L 250 83 L 345 66" fill="none" stroke="#1E4D7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 345 66 L 440 50" fill="none" stroke="#1E4D7A" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"/>
            <circle cx="20" cy="108" r="4" fill="#1E4D7A"/>
            <circle cx="135" cy="97" r="4" fill="#1E4D7A"/>
            <circle cx="250" cy="83" r="4" fill="#1E4D7A"/>
            <circle cx="345" cy="66" r="4" fill="#1E4D7A"/>
            <circle cx="440" cy="50" r="4" fill="white" stroke="#1E4D7A" strokeWidth="2"/>
            {/* Y labels */}
            <text x="0" y="24" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">100</text>
            <text x="0" y="54" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">85</text>
            <text x="0" y="84" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">70</text>
            <text x="0" y="114" fontSize="9" fill="#B0A89E" fontFamily="DM Mono">55</text>
            {/* Score labels */}
            <text x="15" y="100" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">76</text>
            <text x="130" y="90" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">78</text>
            <text x="245" y="75" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">80</text>
            <text x="340" y="57" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500">82</text>
            <text x="435" y="43" fontSize="9" fill="#1D5C3A" fontFamily="DM Mono" fontWeight="500" opacity="0.6">85</text>
            {/* Transaction labels */}
            <text x="15" y="130" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono" fontWeight="500">2,840</text>
            <text x="118" y="130" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono" fontWeight="500">2,910</text>
            <text x="232" y="130" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono" fontWeight="500">3,040</text>
            <text x="327" y="130" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono" fontWeight="500">3,180</text>
            <text x="420" y="130" fontSize="9" fill="#1E4D7A" fontFamily="DM Mono" fontWeight="500" opacity="0.6">3,320</text>
          </svg>
        </div>
        <div className={styles.xLabels}>
          <span className={styles.xLbl}>Nov</span>
          <span className={styles.xLbl}>Dec</span>
          <span className={styles.xLbl}>Jan</span>
          <span className={styles.xLbl}>Feb</span>
          <span className={styles.xLbl} style={{ color: '#1E4D7A', opacity: 0.6 }}>Mar ›</span>
        </div>
        <div className={styles.callout}>
          <span className={styles.calloutIcon}>📈</span>
          <p className={styles.calloutText}>
            Every <strong>1-point increase in team score</strong> correlates to approximately{' '}
            <strong>+47 monthly transactions.</strong> Feb&apos;s score of 82 produced 3,180 transactions
            vs. 2,840 when the score was 76 in November.
          </p>
        </div>
      </div>
    </div>
  )
}
