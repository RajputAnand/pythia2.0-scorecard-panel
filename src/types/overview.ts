import { HeroBannerData } from './hero-banner'
import { ShiftSummaryData } from './shift'
import { CoachingItem } from './coaching'
import { ProgressChartData } from './progress-chart'
import { LeaderboardData } from './leaderboart'

export interface WeeklyStats {
  avg_score: number
  avg_hospitality: number
  avg_checkout_spd: number
  avg_time_to_service: number
  avg_engagement: number
  customers_served: number
  current_score: number
}

export interface OverviewPageData {
  heroBanner: HeroBannerData
  shiftSummary: ShiftSummaryData
  coachingItems: CoachingItem[]
  progressChart: ProgressChartData
  leaderboard: LeaderboardData
}
