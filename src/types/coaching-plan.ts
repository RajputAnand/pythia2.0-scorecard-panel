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
