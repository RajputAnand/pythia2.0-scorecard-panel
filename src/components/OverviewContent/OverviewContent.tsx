'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import type { CoachingMoment, OverviewPageData, ProgressOverTimeData, TeamRankingData, TodayShiftSummary, WeeklyStats } from '@/types/overview'

function OverviewEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">📋</span>
      <p className="font-semibold text-[14px]">No dashboard data yet</p>
      <p className="text-[12px] text-muted">Your scorecard will appear once your first shift is logged.</p>
    </div>
  )
}

export default function OverviewContent({
  overview,
  weeklyStats,
  shiftSummary,
  teamRankingData,
  progressChart,
  coachingMoments,
}: {
  overview: OverviewPageData | null
  weeklyStats: WeeklyStats | null
  shiftSummary: TodayShiftSummary | null
  teamRankingData: TeamRankingData | null
  progressChart: ProgressOverTimeData | null
  coachingMoments: CoachingMoment[]
}) {
  const setCurrentScore = useUserStore((s) => s.setCurrentScore)

  useEffect(() => {
    if (weeklyStats?.overall_score != null) {
      setCurrentScore(weeklyStats.overall_score)
    }
  }, [weeklyStats?.overall_score, setCurrentScore])

  if (!overview || !weeklyStats || !shiftSummary || !teamRankingData || !progressChart) return <OverviewEmpty />

  const hasCoachingItems = coachingMoments.length > 0

  return (
    <div className="grid gap-5">
      <HeroBanner data={overview.heroBanner} weeklyStats={weeklyStats} />

      <div className="grid grid-cols-2 items-start gap-[18px]">
        <ShiftSummary data={overview.shiftSummary} shiftSummary={shiftSummary} />

        {hasCoachingItems ? (
          <CoachingMoments items={coachingMoments} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-10">
            <span className="text-[28px]">🎉</span>
            <p className="text-[12.5px] font-semibold">No coaching moments this week</p>
            <p className="text-[11.5px] text-muted">Keep up the great work!</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 items-start gap-[18px]">
        <ProgressChart data={progressChart} />
        <Leaderboard data={teamRankingData} />
      </div>

      <SwagStore />
    </div>
  )
}
