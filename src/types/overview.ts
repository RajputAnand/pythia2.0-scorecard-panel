import { HeroBannerData } from "./hero-banner";
import { ShiftSummaryData } from "./shift";

export interface WeeklyStats {
  overall_score: number;
  hospitality: number;
  checkout_speed: number;
  time_to_service: number;
  shift_hours: number;
  points: number;
  team_rank: string;
  score_change: number;
  streak_weeks: number;
  display_name: string;
  hospitality_delta: number;
  time_to_service_delta: number;
  team_percentile: number;
  checkout_coaching_active: boolean;
}

export interface TodayShiftSummary {
  shift_date: string;
  shift_status: "complete" | "in_progress" | "stalled";
  overall_score: number;
  customers_served: number;
  avg_checkout_seconds: number;
  points_earned: number;
  shift_date_display: string;
  shift_time_range: string;
  overall_score_delta: number;
  customers_served_delta: number;
  checkout_target_seconds: number;
  is_best_shift_this_week: boolean;
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
    type: "leading" | "trailing" | "tied";
    points_behind: number | null;
    improvement_rate: number | null;
    weeks_to_first: number | null;
    message: string;
  } | null;
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

export interface OverviewPageData {
  heroBanner: HeroBannerData;
  shiftSummary: ShiftSummaryData;
  progressChart: ProgressOverTimeData;
  leaderboard: TeamRankingData;
}

export interface CoachingMoment {
  tip_id: string;
  record_id: string;
  title: string;
  target_text: string;
  target_value: number;
  target_unit: string;
  current_value: number;
  target_points: number;
  current_score: number;
  weekly_change: number;
  status: "in_progress" | "declining" | "resolved" | "stalled";
  areas: string[];
  description: string;
  callout_text: string;
  category: string;
  resolved: boolean;
  callout_type: "tip" | "compliment";
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
}
