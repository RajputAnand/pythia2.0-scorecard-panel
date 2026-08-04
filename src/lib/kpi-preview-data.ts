import type { ManagerDashboardEmployeeRow, ManagerDashboardSummary, ManagerDashboardTrendWeek } from '@/types/manager-dashboard'
import type { CoachingSummary } from '@/types/coaching-plan'
import type { CoachingMoment, ProgressOverTimeData, TeamRankingData } from '@/types/overview'

// Illustrative sample data for the Super Admin "live preview" hover — not
// real activity, just realistic-looking numbers so an admin can see how a
// card/graph actually renders, since the real backend mostly returns
// N/A/0 placeholders right now.

export const PREVIEW_MANAGER_DASHBOARD_SUMMARY: ManagerDashboardSummary = {
  greeted_on_time: { count: 142, rate: 88, tracked: true },
  value_proposition: { count: 97, rate: 61, tracked: true },
  validated: { count: 110, rate: 74, tracked: true },
  thank_you: { count: 130, rate: 82, tracked: true },
  avg_overall_score: 84,
  total_transactions: 162,
  total_points: 4200,
  employees_scored: 9,
  view: 'week',
  week_start: '2026-06-08',
}

export const PREVIEW_COACHING_SUMMARY: CoachingSummary = {
  team_win_rate: { pct: 76, resolved: 19, total: 25, label: 'Resolved', target_label: null },
  avg_time_to_resolve: { weeks: 2.1, target_weeks: 3, target_label: 'under 3 weeks' },
  ai_stalled: { count: 2, flag_label: 'needs review', action_label: 'No stalled issues' },
  in_progress: { count: 5, employees_affected: 3, label: 'In progress' },
  view: 'week',
  week_start: '2026-06-08',
}

export const PREVIEW_PROGRESS_DATA: ProgressOverTimeData = {
  points_change_total: 18,
  weeks: [
    { week_start: '2026-05-04', week_end: '2026-05-10', overall: 74, hospitality: 71, checkout_speed: 76 },
    { week_start: '2026-05-11', week_end: '2026-05-17', overall: 77, hospitality: 74, checkout_speed: 78 },
    { week_start: '2026-05-18', week_end: '2026-05-24', overall: 79, hospitality: 78, checkout_speed: 79 },
    { week_start: '2026-05-25', week_end: '2026-05-31', overall: 81, hospitality: 80, checkout_speed: 82 },
    { week_start: '2026-06-01', week_end: '2026-06-07', overall: 84, hospitality: 83, checkout_speed: 85 },
  ],
}

export const PREVIEW_TEAM_RANKING: TeamRankingData = {
  members: [
    { rank: 1, label: 'Tara C.', is_you: false, initials: 'TC', score: 94, points: 5200 },
    { rank: 2, label: 'Marcus R.', is_you: true, initials: 'MR', score: 88, points: 4700 },
    { rank: 3, label: 'Devon W.', is_you: false, initials: 'DW', score: 85, points: 4400 },
    { rank: 4, label: 'Sofia K.', is_you: false, initials: 'SK', score: 79, points: 3900 },
    { rank: 5, label: 'Jamie L.', is_you: false, initials: 'JL', score: 72, points: 3300 },
  ],
  insight: {
    type: 'behind_leader',
    points_behind: 500,
    improvement_rate: 12,
    weeks_to_first: 3,
    message: "You're **500 points** behind the leader — at your current pace you'll close the gap in **3 weeks**.",
  },
}

export const PREVIEW_COACHING_MOMENTS: CoachingMoment[] = [
  {
    tip_id: 'preview-tip-1',
    record_id: 'preview-1',
    title: 'Add a value proposition more consistently',
    target_text: 'Suggest an upsell on at least 8 of 10 transactions',
    target_unit: '%',
    target_points: 25,
    current_score: 61,
    weekly_change: 6,
    status: 'in_progress',
    areas: ['value_proposition'],
    description: "You're suggesting an upsell on 6 out of 10 transactions — top performers hit 8 or more.",
    callout_text: 'Try pairing your suggestion with the customer\'s first item, right after the greeting.',
    category: 'Value Proposition',
    resolved: false,
    callout_type: 'tip',
    tip_type: 'corrective',
  },
  {
    tip_id: 'preview-tip-2',
    record_id: 'preview-2',
    title: 'Great job on greeting speed this week',
    target_text: 'Keep on-time greetings above 85%',
    target_unit: '%',
    target_points: 25,
    current_score: 88,
    weekly_change: 4,
    status: 'resolved',
    areas: ['greeted_on_time'],
    description: 'Your on-time greeting rate climbed to 88%, up from 84% last week.',
    callout_text: 'Keep it up — this is one of the best rates on the team.',
    category: 'Greeting',
    resolved: true,
    callout_type: 'compliment',
    tip_type: 'recognition',
  },
]

export const PREVIEW_EMPLOYEE_ROWS: ManagerDashboardEmployeeRow[] = [
  { user_id: 'preview-1', name: 'Tara C.', initials: 'TC', role_title: 'Shift Lead', rank: 1, transaction_count: 58, thanked_count: 49, thanked_rate: 84, value_prop_count: 38, value_prop_rate: 66, greeted_count: 55, greeted_rate: 95, avg_overall_score: 94, total_points: 5200 },
  { user_id: 'preview-2', name: 'Marcus R.', initials: 'MR', role_title: 'Cashier', rank: 2, transaction_count: 52, thanked_count: 41, thanked_rate: 79, value_prop_count: 30, value_prop_rate: 58, greeted_count: 47, greeted_rate: 90, avg_overall_score: 88, total_points: 4700 },
  { user_id: 'preview-3', name: 'Devon W.', initials: 'DW', role_title: 'Cashier', rank: 3, transaction_count: 47, thanked_count: 35, thanked_rate: 74, value_prop_count: 24, value_prop_rate: 51, greeted_count: 42, greeted_rate: 89, avg_overall_score: 85, total_points: 4400 },
  { user_id: 'preview-4', name: 'Sofia K.', initials: 'SK', role_title: 'Cashier', rank: 4, transaction_count: 41, thanked_count: 27, thanked_rate: 66, value_prop_count: 18, value_prop_rate: 44, greeted_count: 35, greeted_rate: 85, avg_overall_score: 79, total_points: 3900 },
]

export const PREVIEW_TREND_WEEKS: ManagerDashboardTrendWeek[] = [
  { week_start: '2026-05-04', transaction_count: 140, thanked_rate: 70, value_prop_rate: 52, greeted_rate: 82, avg_overall_score: 74 },
  { week_start: '2026-05-11', transaction_count: 148, thanked_rate: 73, value_prop_rate: 55, greeted_rate: 84, avg_overall_score: 77 },
  { week_start: '2026-05-18', transaction_count: 151, thanked_rate: 76, value_prop_rate: 57, greeted_rate: 86, avg_overall_score: 79 },
  { week_start: '2026-05-25', transaction_count: 157, thanked_rate: 79, value_prop_rate: 59, greeted_rate: 87, avg_overall_score: 81 },
  { week_start: '2026-06-01', transaction_count: 162, thanked_rate: 82, value_prop_rate: 61, greeted_rate: 88, avg_overall_score: 84 },
]

export const PREVIEW_UNKNOWN_IDENTITIES_COUNT = 4
