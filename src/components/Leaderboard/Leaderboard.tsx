import styles from './Leaderboard.module.css'
import panelStyles from '@/components/Panel/Panel.module.css'

type PosVariant = 'gold' | 'silver' | 'bronze' | 'yoursPos' | 'regular'

interface LeaderboardEntry {
  pos: number
  posVariant: PosVariant
  initials: string
  avatarBg: string
  name: string
  isYou?: boolean
  barWidth: string
  barColor: string
  score: number
  scoreIsYou?: boolean
  pts: string
  ptsIsYou?: boolean
}

const ENTRIES: LeaderboardEntry[] = [
  {
    pos: 1, posVariant: 'gold',
    initials: 'TA', avatarBg: '#8B7355',
    name: 'Team Member A',
    barWidth: '91%', barColor: 'var(--color-gold)',
    score: 91, pts: '2,240 pts',
  },
  {
    pos: 2, posVariant: 'yoursPos',
    initials: 'MR', avatarBg: 'var(--color-accent)',
    name: 'Marcus R.', isYou: true,
    barWidth: '84%', barColor: 'var(--color-accent)',
    score: 84, scoreIsYou: true,
    pts: '1,840 pts', ptsIsYou: true,
  },
  {
    pos: 3, posVariant: 'bronze',
    initials: 'TB', avatarBg: '#6A8A5A',
    name: 'Team Member B',
    barWidth: '80%', barColor: '#7EC8A0',
    score: 80, pts: '1,620 pts',
  },
  {
    pos: 4, posVariant: 'regular',
    initials: 'TC', avatarBg: '#7A7A8A',
    name: 'Team Member C',
    barWidth: '69%', barColor: 'var(--color-amber)',
    score: 69, pts: '980 pts',
  },
  {
    pos: 5, posVariant: 'regular',
    initials: 'TD', avatarBg: '#9A6A4A',
    name: 'Team Member D',
    barWidth: '66%', barColor: 'var(--color-amber)',
    score: 66, pts: '820 pts',
  },
]

export default function Leaderboard() {
  return (
    <div className={panelStyles.panel}>
      <div className={panelStyles.header}>
        <div>
          <p className={panelStyles.title}>Team Leaderboard</p>
          <p className={panelStyles.sub}>Anonymized · Your teammates are shown as Team Member A–D</p>
        </div>
        <span className={styles.weekLabel}>This week</span>
      </div>

      <div className={styles.list}>
        {ENTRIES.map((entry) => (
          <div key={entry.pos} className={`${styles.row} ${entry.isYou ? styles.rowYours : ''}`}>
            <div className={`${styles.pos} ${styles[entry.posVariant]}`}>{entry.pos}</div>
            <div
              className={styles.avatar}
              style={{ background: entry.avatarBg }}
            >
              {entry.initials}
            </div>
            <div className={`${styles.name} ${entry.isYou ? styles.nameYours : ''}`}>
              {entry.name}
              {entry.isYou && <span className={styles.youTag}>You</span>}
            </div>
            <div className={styles.barWrap}>
              <div className={styles.barTrack}>
                <div className={styles.barFill} style={{ width: entry.barWidth, background: entry.barColor }} />
              </div>
            </div>
            <div
              className={styles.score}
              style={entry.scoreIsYou ? { color: 'var(--color-accent)' } : { color: 'var(--color-gold)' } as React.CSSProperties}
            >
              {entry.score}
            </div>
            <div className={`${styles.pts} ${entry.ptsIsYou ? styles.ptsYours : ''}`}>{entry.pts}</div>
          </div>
        ))}
      </div>

      <div className={styles.gapNote}>
        You&apos;re <strong>7 points behind #1</strong> this week. At your current improvement rate (+1.5 pts/week),
        you could reach #1 in about 5 weeks. Keep the streak going. 🔥
      </div>
    </div>
  )
}
