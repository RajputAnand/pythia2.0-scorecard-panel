// Raw shape returned by the Pythia-2 /employees endpoint
export interface ApiEmployee {
  id: string
  first_name: string
  last_name: string
  email: string
  role_name: string
  store_ids: string[]
  device_id: string | null
  is_active: boolean
}

export type IssueCategory = 'hospitality' | 'checkout' | 'time' | 'tone'
export type IssueStatus = 'resolved' | 'progress' | 'stalled'
export type PipColor = 'filled-green' | 'filled-amber' | 'filled-red' | 'empty'
export type ScoreDelta = 'up' | 'down' | 'flat'
export type StatColor = 'good' | 'ok' | 'bad' | 'neutral'
export type BadgeStatus = 'resolved' | 'stalled' | 'progress' | 'good'

export interface CoachingIssue {
  id: string
  category: IssueCategory
  description: string
  coaching: string
  scoreBefore: number
  scoreAfter: number
  scoreDelta: number
  scoreDeltaType: ScoreDelta
  weeksLabel: string
  pips: PipColor[]
  status: IssueStatus
  stalled?: boolean
}

export interface EffBar {
  label: string
  pct: string
  fillWidth: string
  fillColor: string // css var e.g. 'var(--color-accent)'
}

export interface Employee {
  id: string
  initials: string
  avatarColor: string
  name: string
  title: string
  meta: string
  badge: BadgeStatus
  winRate: string
  avgWks: string
  stalledCount: string
  winRateColor: StatColor
  avgWksColor: StatColor
  stalledColor: StatColor
  issues: CoachingIssue[]
  effBars: EffBar[]
  circleStroke: string
  circleDasharray: string
  circleDashoffset: string
  circleValueColor?: string
}
