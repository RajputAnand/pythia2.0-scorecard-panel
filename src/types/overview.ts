import { HeroBannerData } from './hero-banner'
import { ShiftSummaryData } from './shift'
import { CoachingItem } from './coaching'
import { ProgressChartData } from './progress-chart'
import { LeaderboardData } from './leaderboart'

export interface OverviewPageData {
  heroBanner: HeroBannerData
  shiftSummary: ShiftSummaryData
  coachingItems: CoachingItem[]
  progressChart: ProgressChartData
  leaderboard: LeaderboardData
}
