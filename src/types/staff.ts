export type ShiftVariant = 'high' | 'mid' | 'low' | 'off' | 'gap' | 'fatigue' | 'suggested'
export type ScoreColor = 'good' | 'ok' | 'bad'
export type RecType = 'coverage' | 'pairing' | 'fatigue' | 'peak'

export interface Shift {
  time: string
  variant: ShiftVariant
  flag?: string
  flagVariant?: 'gap' | 'fatigue' | 'suggested'
}

export interface StaffEmployee {
  id: string
  initials: string
  avatarColor: string
  name: string
  score: number
  scoreColor: ScoreColor
  shifts: Shift[] // Mon → Sun, 7 entries
}

export interface Recommendation {
  id: string
  type: RecType
  typeLabel: string
  text: string
  detail: string
}

export interface TeamScoreMember {
  initials: string
  avatarColor: string
  name: string
  score: number
  barWidth: string
  barColor: string
  scoreColor: ScoreColor
}
