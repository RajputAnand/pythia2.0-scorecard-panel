'use client'

import Header from '@/components/shared/Header/Header'
import WeekNavButtons from '@/components/shared/WeekNavButtons/WeekNavButtons'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import type { DashboardSummaryResponse } from '@/types/overview'

function LeaderboardEmpty({ message }: { message?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">📋</span>
      <p className="font-semibold text-[14px]">{message ? 'Leaderboard unavailable' : 'No leaderboard data yet'}</p>
      <p className="text-[12px] text-muted">{message ?? "Rankings will appear once your team's shifts are logged."}</p>
    </div>
  )
}

export default function LeaderboardContent({
  initialSummary,
  initialError,
}: {
  initialSummary: DashboardSummaryResponse | null
  initialError: string | null
}) {
  const { summary, error, loading, weekOffset, weekLabel, goToPreviousWeek, goToNextWeek } = useDashboardSummary({
    initialSummary,
    initialError,
  })

  return (
    <>
      <Header title="My Dashboard" subtitle={weekLabel}>
        <WeekNavButtons weekOffset={weekOffset} loading={loading} onPrevious={goToPreviousWeek} onNext={goToNextWeek} />
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        {summary ? <Leaderboard data={summary.leaderboard.data} /> : <LeaderboardEmpty message={error} />}
      </div>
    </>
  )
}
