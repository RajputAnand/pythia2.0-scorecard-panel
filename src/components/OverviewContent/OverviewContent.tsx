'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/shared/Header/Header'
import WeekNavButtons from '@/components/shared/WeekNavButtons/WeekNavButtons'
import DatePicker from '@/components/shared/DatePicker/DatePicker'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import SwagStore from '@/components/SwagStore/SwagStore'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { useShiftHighlights } from '@/hooks/useShiftHighlights'
import type { CoachingMoment, DashboardSummaryResponse, OverviewPageData } from '@/types/overview'
import type { ShiftHighlight } from '@/types/shift'

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
  initialShiftHighlights,
  initialShiftHighlightsGenerating,
}: {
  overview: OverviewPageData | null
  initialSummary: DashboardSummaryResponse | null
  initialError: string | null
  coachingMoments: CoachingMoment[]
  coachingGenerationInProgress: boolean
  initialShiftHighlights: ShiftHighlight[]
  initialShiftHighlightsGenerating: boolean
}) {
  const {
    summary,
    error,
    loading,
    weekOffset,
    weekLabel,
    goToPreviousWeek,
    goToNextWeek,
    dateFrom,
    dateTo,
    setDateFrom,
    setDateTo,
    clearDateFilter,
    hasActiveDateFilter,
  } = useDashboardSummary({
    initialSummary,
    initialError,
    initialWeekOffset: 0,
  })
  const setCurrentScore = useUserStore((s) => s.setCurrentScore)
  const { items: shiftHighlights, generationInProgress: shiftHighlightsGenerating } = useShiftHighlights({
    shiftStart: summary?.today.shift_start,
    shiftStatus: summary?.today.data.shift_status,
    initialItems: initialShiftHighlights,
    initialGenerationInProgress: initialShiftHighlightsGenerating,
  })

  useEffect(() => {
    if (summary?.weekly.data.overall_score != null) {
      setCurrentScore(summary.weekly.data.overall_score)
    }
  }, [summary?.weekly.data.overall_score, setCurrentScore])

  return (
    <>
      <Header title="My Dashboard" subtitle={weekLabel}>
        <div className="flex items-center gap-2">
          {!hasActiveDateFilter && (
            <WeekNavButtons weekOffset={weekOffset} loading={loading} onPrevious={goToPreviousWeek} onNext={goToNextWeek} />
          )}
          {!hasActiveDateFilter && <div className="bg-border shrink-0 w-px h-5" />}
          <div className="flex items-center gap-[6px]">
            <DatePicker ariaLabel="Filter start date" value={dateFrom} onChange={setDateFrom} max={dateTo} />
            <span className="text-muted text-[11px]">to</span>
            <DatePicker ariaLabel="Filter end date" value={dateTo} onChange={setDateTo} min={dateFrom} />
          </div>
          {hasActiveDateFilter && (
            <button
              type="button"
              onClick={clearDateFilter}
              className="cursor-pointer flex items-center gap-[6px] border border-border rounded-[7px] font-sans font-medium text-secondary bg-surface text-[11.5px] px-[10px] py-[5px] transition-colors duration-150 hover:border-accent hover:text-accent"
            >
              <svg className="w-[11px] h-[11px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Clear filter
            </button>
          )}
        </div>
      </Header>

      <div className="grid px-[30px] py-[24px] gap-5">
        {loading ? (
          <OverviewSkeleton />
        ) : !overview || !summary ? (
          <OverviewEmpty message={error} />
        ) : (
          <div className="grid gap-5">
            <HeroBanner data={overview.heroBanner} weeklyStats={summary.weekly.data} isCustomRange={hasActiveDateFilter} />

            <ShiftSummary
              shiftSummary={summary.today.data}
              highlights={shiftHighlights}
              highlightsGenerating={shiftHighlightsGenerating}
            />
            <div className="grid grid-cols-2 items-start gap-[18px]">
              <CoachingMoments items={coachingMoments} generationInProgress={coachingGenerationInProgress} />  
              <Leaderboard data={summary.leaderboard.data} />
            </div>
            {summary.progress.weeks.length > 0 ? (
                <ProgressChart data={summary.progress} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-10">
                  <span className="text-[28px]">📈</span>
                  <p className="text-[12.5px] font-semibold">No progress data yet</p>
                </div>
              )}
            
            <SwagStore />
          </div>
        )}
      </div>
    </>
  )
}
