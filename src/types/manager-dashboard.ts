export type ManagerDashboardView = 'week' | 'all'

// Mirrors get_dashboard_summary in app/services/manager_dashboard_service.py —
// GET /manager-dashboard/summary.
export interface ManagerDashboardCard {
  count: number
  rate: number
  // False for "validated" until the scoring pipeline has a raw_metrics field
  // for it (see calculator.build_coaching_steps) — rate is always 0 then,
  // and the frontend should render "not yet tracked" rather than a real 0%.
  tracked: boolean
}

export interface ManagerDashboardSummary {
  greeted_on_time: ManagerDashboardCard
  value_proposition: ManagerDashboardCard
  validated: ManagerDashboardCard
  thank_you: ManagerDashboardCard
  avg_overall_score: number
  total_transactions: number
  total_points: number
  employees_scored: number
  view: ManagerDashboardView
  week_start: string | null
}

export type ManagerDashboardSortBy =
  | 'thanked_count'
  | 'thanked_rate'
  | 'value_prop_count'
  | 'value_prop_rate'
  | 'greeted_count'
  | 'greeted_rate'
  | 'transaction_count'
  | 'avg_overall_score'
  | 'total_points'

// Mirrors one row of get_weekly_trend — GET /manager-dashboard/trend.
export interface ManagerDashboardTrendWeek {
  week_start: string
  transaction_count: number
  thanked_rate: number
  value_prop_rate: number
  greeted_rate: number
  avg_overall_score: number
}

// Mirrors one row of get_thank_you_leaderboard — GET /manager-dashboard/leaderboard.
export interface ManagerDashboardEmployeeRow {
  user_id: string
  name: string
  initials: string
  role_title: string
  rank: number
  transaction_count: number
  thanked_count: number
  thanked_rate: number
  value_prop_count: number
  value_prop_rate: number
  greeted_count: number
  greeted_rate: number
  avg_overall_score: number
  total_points: number
}
