'use client'

import Header from '@/components/shared/Header/Header'
import WeekNavButtons from '@/components/shared/WeekNavButtons/WeekNavButtons'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import type { DashboardSummaryResponse } from '@/types/overview'

function ProgressEmpty({ message }: { message?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">📋</span>
      <p className="font-semibold text-[14px]">{message ? 'Progress unavailable' : 'No progress data yet'}</p>
      <p className="text-[12px] text-muted">{message ?? 'Your weekly progress will appear once your first shift is logged.'}</p>
    </div>
  )
}

export default function ProgressContent({
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
      <Header title="My Progress" subtitle={weekLabel}>
        <WeekNavButtons weekOffset={weekOffset} loading={loading} onPrevious={goToPreviousWeek} onNext={goToNextWeek} />
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        {summary && summary.progress.weeks.length > 0 ? (
          <ProgressChart data={summary.progress} />
        ) : (
          <ProgressEmpty message={error} />
        )}
      </div>
    </>
  )
}
