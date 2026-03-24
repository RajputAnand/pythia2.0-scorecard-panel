export type PosVariant = 'gold' | 'silver' | 'bronze' | 'yoursPos' | 'regular'

export interface LeaderboardEntry {
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

export interface LeaderboardData {
  title: string
  subtitle: string
  periodLabel: string
  entries: LeaderboardEntry[]
  /** Use **text** for bold segments */
  insightText: string
}
