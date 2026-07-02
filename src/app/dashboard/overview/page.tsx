import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import Header from '@/components/shared/Header/Header'
import OverviewContent from '@/components/OverviewContent/OverviewContent'
import headerStyles from '@/components/shared/Header/Header.module.css'
import { fetchOverview } from '@/queries/overview'
import { queryKeys } from '@/queries/keys'
import { fetchProgressOverTime, fetchTeamRanking, fetchTodayShiftSummary, fetchWeeklyStats } from '@/queries/scorecard'
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
  const coachingMoments: CoachingMoment[] = []

  if (session?.user?.pythia2Token) {
    try {
      weeklyStats = await fetchWeeklyStats(session.user.pythia2Token)
    } catch(err) {
      console.log(err)
      // non-fatal — OverviewContent renders an empty state when null
    }
    try {
      shiftSummary = await fetchTodayShiftSummary(session.user.pythia2Token)
    } catch(err) {
      console.log(err)
      // non-fatal — OverviewContent renders an empty state when null
    }
    try {
      teamRankingData = await fetchTeamRanking(session.user.pythia2Token)
    } catch(err) {
      console.log(err)
      // non-fatal — OverviewContent renders an empty state when null
    }
    try {
      progressChart = await fetchProgressOverTime(session.user.pythia2Token)
    } catch(err) {
      console.log(err)
      // non-fatal — OverviewContent renders an empty state when null
    }
  }

  return (
    <>
      <Header title="My Dashboard" subtitle={getWeekSubtitle(currentDate)}>
        <button className={headerStyles.btnGhost}>View Last Week</button>
        <button className={headerStyles.btnAccent}>📣 Share My Score</button>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <OverviewContent weeklyStats={weeklyStats} shiftSummary={shiftSummary} teamRankingData={teamRankingData} progressChart={progressChart} />
        </HydrationBoundary>
      </div>
    </>
  )
}
