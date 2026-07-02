'use client'

import { useEffect } from 'react'
import { useOverviewPageData } from '@/queries/overview'
// MIXED-CONTENT FIX: weeklyStats is now fetched server-side in page.tsx and
// passed as a prop. The client-side fetch below is kept as a comment so it can
// be restored once the API is served over HTTPS.
// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { fetchWeeklyStats } from '@/queries/scorecard'
import { useUserStore } from '@/store/userStore'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import type { ProgressOverTimeData, TeamRankingData, TodayShiftSummary, WeeklyStats } from '@/types/overview'
import { useSession } from 'next-auth/react'

function OverviewError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">⚠️</span>
      <p className="font-semibold text-[14px]">Failed to load dashboard</p>
      <p className="text-[12px] text-muted">Check your connection and try again.</p>
      <button
        className="mt-1 rounded-[8px] border-0 bg-accent px-4 py-2 text-[12.5px] font-semibold text-white hover:opacity-85"
        onClick={onRetry}
      >
        Retry
      </button>
    </div>
  )
}

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
  weeklyStats,
  shiftSummary,
  teamRankingData,
  progressChart,
}: {
  weeklyStats: WeeklyStats | null
  shiftSummary: TodayShiftSummary | null
  teamRankingData: TeamRankingData | null
  progressChart: ProgressOverTimeData | null
}) {
  const { overview: data, isError, isFetching, isStale, refetch } = useOverviewPageData()
  const setCurrentScore = useUserStore((s) => s.setCurrentScore)
  const { data: session } = useSession()

  useEffect(() => {
    if (weeklyStats?.overall_score != null) {
      setCurrentScore(weeklyStats.overall_score)
    }
  }, [weeklyStats?.overall_score, setCurrentScore])

  // MIXED-CONTENT FIX: client-side fetch replaced by server-side prop.
  // Restore this block (and remove the prop) once the API is served over HTTPS:
  // const { data: session } = useSession()
  // const pythia2Token = session?.user?.pythia2Token
  // const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  // useEffect(() => {
  //   if (!pythia2Token) return
  //   fetchWeeklyStats(pythia2Token).then(setWeeklyStats).catch(() => {})
  // }, [pythia2Token])
  console.log(weeklyStats, shiftSummary,teamRankingData ,"fffff")
  if (isError) return <OverviewError onRetry={refetch} />
  if (!data || !weeklyStats || !shiftSummary || !teamRankingData || !progressChart || !session) return <OverviewEmpty />

  const hasCoachingItems = data.coachingItems.length > 0

  return (
    <div className="grid gap-5">
      {(isFetching || isStale) && (
        <div className="flex items-center justify-end gap-2 -mb-1">
          {isFetching && (
            <span className="flex items-center gap-1.5 rounded-full bg-accent-light px-3 py-1 text-[11px] font-medium text-accent">
              <span className="inline-block h-1.5 w-1.5 animate-ping rounded-full bg-accent" />
              Syncing
            </span>
          )}
          {isStale && !isFetching && (
            <span className="rounded-full border border-border px-3 py-1 text-[11px] text-muted">
              Data may be outdated
            </span>
          )}
        </div>
      )}

      <HeroBanner data={data.heroBanner} weeklyStats={weeklyStats} />

      <div className="grid grid-cols-2 items-start gap-[18px]">
        <ShiftSummary data={data.shiftSummary} shiftSummary={shiftSummary} />

        {hasCoachingItems ? (
          <CoachingMoments items={data.coachingItems} />
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
