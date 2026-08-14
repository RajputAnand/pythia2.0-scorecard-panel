export type ShiftVariant = 'high' | 'mid' | 'low' | 'off' | 'gap' | 'fatigue' | 'suggested'
export type ScoreColor = 'good' | 'ok' | 'bad'
export type RecType = 'coverage_gap' | 'weak_pairing' | 'alone_at_peak' | 'fatigue_shift' | 'fatigue_weekly'

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
  id: string
  initials: string
  avatarColor: string
  name: string
  score: number
  barWidth: string
  barColor: string
  scoreColor: ScoreColor
}

// ---------------------------------------------------------------------------
// Raw API shapes — as returned by app/routers/staffing.py, before any
// transform. See src/lib/staffing-transform.ts for the mapping into the UI
// types above.
// ---------------------------------------------------------------------------

export type ScoreTier = 'high' | 'mid' | 'needs_support'

export interface ApiShiftFlag {
  type: RecType
  severity: 'critical' | 'warning'
}

export interface ApiShift {
  id: string
  employee_id: string
  date: string
  day_part: string
  status: string
  source: 'actual' | 'suggested' | 'manual' | 'ai_recommendation'
  paired_with?: string | null
  employee_first_name?: string
  employee_last_name?: string
  employee_score?: number
  employee_score_tier?: ScoreTier
  flags?: ApiShiftFlag[]
}

export interface ApiScheduleResponse {
  store_id: string
  week_start_date: string
  week_end_date: string
  total_shifts: number
  by_employee: Record<string, ApiShift[]>
  shifts: ApiShift[]
}

export interface ApiRosterMember {
  employee_id: string
  first_name: string
  last_name: string
  score: number
  score_tier: ScoreTier
}

export interface ApiHeatmapCell {
  segment: string
  count: number
  intensity: 'moderate' | 'high' | 'very_high' | 'critical'
}

export interface ApiHeatmapDay {
  date_local: string
  day_label: string
  cells: ApiHeatmapCell[]
  peak_segment: string | null
  peak_intensity: string
}

export interface ApiTrafficHeatmap {
  store_id: string
  week_start_date: string
  week_end_date: string
  days: ApiHeatmapDay[]
}

export interface ApiInsights {
  coverage_gaps: number
  coverage_gaps_sub_bold: string
  coverage_gaps_sub: string
  fatigue_flags: number
  fatigue_flags_sub_bold: string
  fatigue_flags_sub: string
  weak_pairings: number
  weak_pairings_sub_bold: string
  weak_pairings_sub: string
  optimized_shifts: number
  optimized_shifts_sub_bold: string
  optimized_shifts_sub: string
}

export interface ApiRecommendationTarget {
  date?: string | null
  day_part?: string | null
  employee_id?: string | null
  employee_ids?: string[]
  suggested_employee_id?: string | null
}

export interface ApiRecommendation {
  id: string
  type: RecType
  type_label: string
  text: string
  detail: string
  severity: 'critical' | 'warning'
  target: ApiRecommendationTarget
  status: 'active' | 'applied' | 'dismissed'
  created_at: string
  resolved_at?: string | null
}

export interface ApiCriticalAlert {
  recommendation_id: string
  text: string
  detail: string
}

export interface ApiRecommendationsResponse {
  store_id: string
  week_start_date: string
  generation_status: 'idle' | 'generating' | 'done' | 'failed'
  generated_at: string | null
  critical_alert: ApiCriticalAlert | null
  recommendations: ApiRecommendation[]
}
