import styles from './RoiHero.module.css'

export default function RoiHero() {
  return (
    <div className={styles.roiHero}>
      <div className={styles.stat}>
        <div className={styles.label}>Est. Revenue Impact</div>
        <div className={`${styles.value} ${styles.green}`}>+$18,240</div>
        <div className={styles.change}>
          <span className={`${styles.pill} ${styles.up}`}>+12.4%</span>
          <span className={styles.sub}>vs. prior 4 months</span>
        </div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Team Score Avg</div>
        <div className={styles.value}>76 → 82</div>
        <div className={styles.change}>
          <span className={`${styles.pill} ${styles.up}`}>+6 pts</span>
          <span className={styles.sub}>4-month improvement</span>
        </div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Pythia Platform Cost</div>
        <div className={`${styles.value} ${styles.amber}`}>$1,440</div>
        <div className={styles.change}>
          <span className={`${styles.pill} ${styles.neutral}`}>4 months</span>
          <span className={styles.sub}>$360/mo all-in</span>
        </div>
      </div>
      <div className={styles.stat}>
        <div className={styles.label}>Net ROI</div>
        <div className={`${styles.value} ${styles.green}`}>12.7×</div>
        <div className={styles.change}>
          <span className={`${styles.pill} ${styles.up}`}>$16,800 net</span>
          <span className={styles.sub}>after platform cost</span>
        </div>
      </div>
    </div>
  )
}
