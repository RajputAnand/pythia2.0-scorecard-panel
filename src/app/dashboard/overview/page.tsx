import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import Header from '@/components/shared/Header/Header'
import OverviewContent from '@/components/OverviewContent/OverviewContent'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { fetchOverview } from '@/queries/overview'
import { queryKeys } from '@/queries/keys'
import { fetchCoachingMoments, fetchProgressOverTime, fetchTeamRanking, fetchTodayShiftSummary, fetchWeeklyStats } from '@/queries/scorecard'
import { auth } from '@/auth'
import type { CoachingMoment, ProgressOverTimeData, TeamRankingData, TodayShiftSummary, WeeklyStats } from '@/types/overview'
import { getWeekSubtitle } from '@/utils/common'

export default async function OverviewPage() {
  const currentDate = new Date(2026, 5, 14) // replace with new Date() in production
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: queryKeys.overview.dashboard(),
    queryFn: fetchOverview,
  })

  // MIXED-CONTENT FIX: fetchWeeklyStats calls an http:// endpoint which is
  // blocked by browsers when the app is served over HTTPS. Fetching server-side
  // avoids the restriction because Node.js has no mixed-content policy.
  // TODO: remove this workaround once the API is served over HTTPS.
  const session = await auth()
  let weeklyStats: WeeklyStats | null = null
  let shiftSummary: TodayShiftSummary | null = null
  let teamRankingData: TeamRankingData | null = null
  let progressChart: ProgressOverTimeData | null = null
  let coachingMoments: CoachingMoment[] = []

  if (session?.user?.pythia2Token) {
    const token = session.user.pythia2Token
    const [weeklyStatsResult, shiftSummaryResult, teamRankingResult, progressChartResult, coachingMomentsResult] =
      await Promise.allSettled([
        fetchWeeklyStats(token),
        fetchTodayShiftSummary(token),
        fetchTeamRanking(token),
        fetchProgressOverTime(token),
        fetchCoachingMoments(token),
      ])

    // non-fatal — OverviewContent renders an empty state when null/empty
    if (weeklyStatsResult.status === 'fulfilled') weeklyStats = weeklyStatsResult.value
    else console.log(weeklyStatsResult.reason)

    if (shiftSummaryResult.status === 'fulfilled') shiftSummary = shiftSummaryResult.value
    else console.log(shiftSummaryResult.reason)

    if (teamRankingResult.status === 'fulfilled') teamRankingData = teamRankingResult.value
    else console.log(teamRankingResult.reason)

    if (progressChartResult.status === 'fulfilled') progressChart = progressChartResult.value
    else console.log(progressChartResult.reason)

    if (coachingMomentsResult.status === 'fulfilled') coachingMoments = coachingMomentsResult.value
    else console.log(coachingMomentsResult.reason)
  }

  return (
    <>
      <Header title="My Dashboard" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <OverviewContent weeklyStats={weeklyStats} shiftSummary={shiftSummary} teamRankingData={teamRankingData} progressChart={progressChart} coachingMoments={coachingMoments} />
        </HydrationBoundary>
      </div>
    </>
  )
}
