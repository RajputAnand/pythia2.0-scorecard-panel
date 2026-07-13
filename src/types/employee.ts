// Raw shape returned by the Pythia-2 /employees endpoint. There's no fixed
// response schema (per the API docs) — records created via the old Pythia-1
// migration carry camelCase firstName/lastName with no first_name/last_name,
// while records created via POST /employees use snake_case natively.
// Two different identifiers, both always present: `user_id` (the
// human-readable id — `GET/PUT/DELETE /employees/{user_id}` and the
// credentials endpoint all key off this) and `_id` (the Mongo id — despite
// the query param being named `user_id`, `POST /unknown-identities/{id}/assign`
// actually expects this one; confirmed against the live backend).
export interface ApiEmployee {
  _id: string
  user_id: string
  first_name?: string | null
  last_name?: string | null
  firstName?: string | null
  lastName?: string | null
  email: string
  phone?: string | null
  role_name: string
  store_ids: string[]
  device_id: string | null
  is_active: boolean
  must_change_password?: boolean
}

export interface CreateEmployeeParams {
  token: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  images?: File[]
}

// Raw response from POST /employees (multipart/form-data request)
export interface CreateEmployeeResponse {
  success: boolean
  user_id: string
  temp_password: string
  email_sent: boolean
  images: string[]
  message: string
}

// Raw `data` payload from GET /employees/{user_id}/credentials
export interface EmployeeCredentials {
  user_id: string
  temp_password: string
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
