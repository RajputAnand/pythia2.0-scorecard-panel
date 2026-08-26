import { HeroBannerData } from "./hero-banner";

export interface WeeklyStats {
  overall_score: number;
  hospitality: number;
  checkout_speed: number;
  time_to_service: number;
  shift_hours: number;
  points: number;
  team_rank: string | null;
  score_change: number;
  streak_weeks: number;
  display_name: string;
  hospitality_delta: number;
  time_to_service_delta: number;
  team_percentile: number | null;
  checkout_coaching_active: boolean;
}

export interface WeeklySection {
  week_start: string;
  week_end: string;
  data: WeeklyStats;
}

export interface TodayShiftSummary {
  shift_date: string;
  shift_status: "complete" | "in_progress" | "no_data";
  overall_score: number;
  customers_served: number;
  avg_checkout_seconds: number | null;
  points_earned: number;
  shift_date_display: string;
  shift_time_range: string;
  overall_score_delta: number | null;
  customers_served_delta: number | null;
  checkout_target_seconds: number;
  is_best_shift_this_week: boolean;
}

export interface TodaySection {
  // Absent (not present on the object) when no shift data exists yet — check
  // with `'shift_start' in section`, not a falsy check.
  shift_start?: string;
  shift_end?: string;
  data: TodayShiftSummary;
}

export interface TeamRankingData {
  members: {
    rank: number;
    label: string;
    is_you: boolean;
    initials: string;
    score: number;
    points: number;
  }[];
  insight: {
    type: "no_data" | "leading" | "behind_leader_no_rate" | "behind_leader";
    points_behind: number | null;
    improvement_rate: number | null;
    weeks_to_first: number | null;
    message: string;
  } | null;
}

export interface LeaderboardSection {
  week_start: string;
  week_end: string;
  data: TeamRankingData;
}

export interface ProgressOverTimeChartData {
  week_start: string;
  week_end: string;
  overall: number;
  hospitality: number;
  checkout_speed: number;
}

export interface ProgressOverTimeData {
  points_change_total: number;
  weeks: ProgressOverTimeChartData[];
}

export interface DashboardSummaryResponse {
  success: boolean;
  weekly: WeeklySection;
  today: TodaySection;
  leaderboard: LeaderboardSection;
  progress: ProgressOverTimeData;
}

export interface OverviewPageData {
  heroBanner: HeroBannerData;
}

export interface CoachingMoment {
  tip_id: string;
  record_id: string;
  title: string;
  target_text: string;
  // Stripped by the backend before an employee ever sees this payload
  // (app/routers/coaching_moments.py::_sanitize_tips_for_employee) — never
  // rely on these being present.
  target_value?: number;
  target_unit: string;
  current_value?: number;
  target_points: number;
  current_score: number;
  weekly_change: number;
  status: "in_progress" | "declining" | "resolved" | "stalled";
  areas: string[];
  description: string;
  callout_text: string;
  category: string;
  resolved: boolean;
  callout_type: "tip" | "compliment" | "celebration";
  // "recognition" means the underlying coaching signal just resolved — this is a
  // praise tip, not a corrective one. Defaults to "corrective" server-side for
  // older records generated before this was tracked.
  tip_type: "corrective" | "recognition";
}

export interface CoachingWeeklySnapshot {
  week_score_id: string;
  avg_score: number;
  avg_hospitality: number;
  avg_checkout_spd: number;
  avg_time_to_service: number;
  avg_engagement: number;
  current_score: number;
  customers_served: number;
  week_start: string;
  week_end: string;
}

export interface CoachingMomentsResponse {
  success: boolean;
  message: string;
  weekly_data: { success: boolean; data: CoachingWeeklySnapshot; weekly_data: CoachingWeeklySnapshot }[];
  coaching_tips: CoachingMoment[];
  cached: boolean;
  generated_at: string;
  source: string;
  // Only present on the "on_demand" branch (no cache found yet) — a Celery
  // job was queued and coaching_tips is empty until the next explicit fetch.
  generation_in_progress?: boolean;
}

export interface CoachingMomentsResult {
  items: CoachingMoment[];
  generationInProgress: boolean;
}
