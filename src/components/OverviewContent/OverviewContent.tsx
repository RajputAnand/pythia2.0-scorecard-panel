'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header/Header'
import WeekNavButtons from '@/components/shared/WeekNavButtons/WeekNavButtons'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
// import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import type { CoachingMoment, DashboardSummaryResponse, OverviewPageData } from '@/types/overview'

function OverviewEmpty({ message }: { message?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">📋</span>
      <p className="font-semibold text-[14px]">{message ? 'Dashboard unavailable' : 'No dashboard data yet'}</p>
      <p className="text-[12px] text-muted">{message ?? 'Your scorecard will appear once your first shift is logged.'}</p>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-5 animate-pulse">
      <div className="h-40 w-full rounded-xl bg-border" />
      <div className="grid grid-cols-2 items-start gap-[18px]">
        <div className="h-72 rounded-xl bg-border" />
        <div className="h-72 rounded-xl bg-border" />
      </div>
    </div>
  )
}

export default function OverviewContent({
  overview,
  initialSummary,
  initialError,
  coachingMoments,
  coachingGenerationInProgress,
}: {
  overview: OverviewPageData | null
  initialSummary: DashboardSummaryResponse | null
  initialError: string | null
  coachingMoments: CoachingMoment[]
  coachingGenerationInProgress: boolean
}) {
  const { summary, error, loading, weekOffset, weekLabel, goToPreviousWeek, goToNextWeek } = useDashboardSummary({
    initialSummary,
    initialError,
  })
  const setCurrentScore = useUserStore((s) => s.setCurrentScore)

  useEffect(() => {
    if (summary?.weekly.data.overall_score != null) {
      setCurrentScore(summary.weekly.data.overall_score)
    }
  }, [summary?.weekly.data.overall_score, setCurrentScore])

  return (
    <>
      <Header title="My Dashboard" subtitle={weekLabel}>
        <WeekNavButtons weekOffset={weekOffset} loading={loading} onPrevious={goToPreviousWeek} onNext={goToNextWeek} />
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        {loading ? (
          <OverviewSkeleton />
        ) : !overview || !summary ? (
          <OverviewEmpty message={error} />
        ) : (
          <div className="grid gap-5">
            <HeroBanner data={overview.heroBanner} weeklyStats={summary.weekly.data} />

            {/* <ShiftSummary data={overview.shiftSummary} shiftSummary={summary.today.data} /> */}

            <CoachingMoments items={coachingMoments} generationInProgress={coachingGenerationInProgress} />

            <div className="grid grid-cols-2 items-start gap-[18px]">
              {summary.progress.weeks.length > 0 ? (
                <ProgressChart data={summary.progress} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-10">
                  <span className="text-[28px]">📈</span>
                  <p className="text-[12.5px] font-semibold">No progress data yet</p>
                </div>
              )}
              <Leaderboard data={summary.leaderboard.data} />
            </div>

            <SwagStore />
          </div>
        )}
      </div>
    </>
  )
}
