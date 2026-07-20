'use client'

import Header from '@/components/shared/Header/Header'
import WeekNavButtons from '@/components/shared/WeekNavButtons/WeekNavButtons'
import Panel from '@/components/shared/Panel/Panel'
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

function LeaderboardSkeleton() {
  return (
    <Panel title="Team Leaderboard" subtitle="How you stack up against your team this week" noPadding>
      <div className="flex flex-col animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center border-b border-border gap-3 px-5 py-[11px] last:border-b-0">
            <div className="rounded-[7px] shrink-0 w-6 h-6 bg-border" />
            <div className="rounded-full shrink-0 w-7 h-7 bg-border" />
            <div className="h-3 flex-1 rounded bg-border" />
            <div className="w-[90px] h-[6px] rounded-[3px] bg-border" />
            <div className="h-3 w-7 rounded bg-border" />
            <div className="h-3 w-14 rounded bg-border" />
          </div>
        ))}
      </div>
    </Panel>
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
        {loading ? (
          <LeaderboardSkeleton />
        ) : summary ? (
          <Leaderboard data={summary.leaderboard.data} />
        ) : (
          <LeaderboardEmpty message={error} />
        )}
      </div>
    </>
  )
}
