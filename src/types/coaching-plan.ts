// Mirrors app/models/coaching_signal.py — ConversationPlan / ManagerPlanEntry (backend).
export interface ConversationPlan {
  opening_recognition: string
  what_to_notice: string
  why_it_matters: string
  what_to_ask: string
  what_to_practice: string
  how_to_follow_up: string
  confidence_note: string
}

export type ManagerPlanStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed'

export interface ManagerActionLogEntry {
  action: string
  actor_id: string
  reason: string
  note: string
  at: string
}

// Flattened shape returned by GET/PATCH /manager-coaching/signals — a
// ManagerPlanEntry merged with its parent CoachingSignal's identifying fields
// (see _flatten in app/routers/manager_coaching.py).
export interface ManagerCoachingPlan {
  plan_id: string
  escalation_id: string
  signal_id: string
  user_id: string
  store_id: string
  category: string
  plan: ConversationPlan
  status: ManagerPlanStatus
  cost: number
  actions: ManagerActionLogEntry[]
  created_at: string
  updated_at: string
  resolved_at?: string | null
}

// Subset of ConversationPlan fields a manager may overwrite via an "edited" action.
export type PlanEditFields = Partial<ConversationPlan>

export interface ManagerActionRequestBody {
  action: 'viewed' | 'dismissed' | 'edited' | 'resolved'
  reason?: string
  note?: string
  edits?: PlanEditFields
}

export type CoachingView = 'month' | 'all'

// Mirrors get_coaching_summary in app/services/manager_coaching_service.py —
// the 4-card summary returned by GET /manager-coaching/summary (and embedded
// under `summary` in GET /manager-coaching/employees/{user_id}).
export interface CoachingSummary {
  team_win_rate: {
    pct: number
    resolved: number
    total: number
    label: string
    target_label: string | null
  }
  avg_time_to_resolve: {
    weeks: number | null
    target_weeks: number
    target_label: string
  }
  ai_stalled: {
    count: number
    flag_label: string
    action_label: string
  }
  in_progress: {
    count: number
    employees_affected: number
    label: string
  }
  view: CoachingView
  month_start: string | null
}

// Mirrors one row of get_coaching_effectiveness — GET /manager-coaching/effectiveness,
// and the `categories` array under GET /manager-coaching/employees/{user_id}.
export interface CoachingEffectivenessRow {
  category: string
  total: number
  resolved: number
  in_progress: number
  stalled: number
  resolved_pct: number
  avg_weeks_to_resolve: number | null
}

// Mirrors get_employee_coaching_list — GET /manager-coaching/employees.
export interface CoachingEmployeeChip {
  user_id: string
  name: string
  role_title: string
  health: 'red' | 'amber' | 'green'
  total_issues: number
}

export type CoachingIssueStatus = 'resolved' | 'in_progress' | 'stalled'

// Mirrors one entry of the `signals` array in get_employee_coaching_detail —
// GET /manager-coaching/employees/{user_id}.
export interface CoachingEmployeeIssue {
  signal_id: string
  category: string
  issue_title: string
  coach_quote: string | null
  status: CoachingIssueStatus
  first_score: number | null
  current_score: number | null
  score_delta: number | null
  weeks_tracked: number | null
  first_flagged_at: string | null
  resolved_at: string | null
}

// Mirrors get_employee_coaching_detail — GET /manager-coaching/employees/{user_id}.
export interface CoachingEmployeeDetail {
  user_id: string
  days: number
  summary: CoachingSummary
  signals: CoachingEmployeeIssue[]
  categories: CoachingEffectivenessRow[]
}
