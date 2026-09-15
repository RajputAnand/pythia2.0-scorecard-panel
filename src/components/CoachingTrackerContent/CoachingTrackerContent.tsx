'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/shared/Header/Header'
import DatePicker from '@/components/shared/DatePicker/DatePicker'
import CoachingWinStrip from '@/components/CoachingWinStrip/CoachingWinStrip'
import CoachingTrackerPanel from '@/components/CoachingTrackerPanel/CoachingTrackerPanel'
import { fetchCoachingSummary, fetchCoachingEmployees } from '@/queries/manager-coaching'
import { formatDateRange, extractApiErrorMessage } from '@/utils/common'
import type { CoachingSummary, CoachingEmployeeChip } from '@/types/coaching-plan'

interface CoachingTrackerContentProps {
  initialSummary: CoachingSummary | null
  initialEmployees: CoachingEmployeeChip[]
  selectedStoreId?: string
  subtitle?: string
}

export default function CoachingTrackerContent({
  initialSummary,
  initialEmployees,
  selectedStoreId,
  subtitle,
}: CoachingTrackerContentProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [summary, setSummary] = useState<CoachingSummary | null>(initialSummary)
  const [employees, setEmployees] = useState<CoachingEmployeeChip[]>(initialEmployees)
  const [coachingError, setCoachingError] = useState<string | null>(null)
  const [, setLoading] = useState(false)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasActiveDateFilter = Boolean(dateFrom && dateTo)
  const appliedDateFrom = hasActiveDateFilter ? dateFrom : ''
  const appliedDateTo = hasActiveDateFilter ? dateTo : ''

  const isFirstRun = useRef(true)

  useEffect(() => {
    setSummary(initialSummary)
  }, [initialSummary])

  useEffect(() => {
    setEmployees(initialEmployees)
  }, [initialEmployees])

  useEffect(() => {
    if (isFirstRun.current && !appliedDateFrom && !appliedDateTo) {
      isFirstRun.current = false
      return
    }
    isFirstRun.current = false
    if (!token) return

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setLoading(true)
    })

    Promise.allSettled([
      fetchCoachingSummary({
        token,
        view: hasActiveDateFilter ? 'custom' : 'month',
        storeId: selectedStoreId,
        startDate: appliedDateFrom || undefined,
        endDate: appliedDateTo || undefined,
      }),
      fetchCoachingEmployees({
        token,
        storeId: selectedStoreId,
        startDate: appliedDateFrom || undefined,
        endDate: appliedDateTo || undefined,
        view: hasActiveDateFilter ? 'custom' : 'month',
      }),
    ])
      .then(([summaryRes, employeesRes]) => {
        if (cancelled) return
        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value)
          setCoachingError(null)
        } else {
          setCoachingError(extractApiErrorMessage(summaryRes.reason, 'Failed to update coaching data'))
        }
        if (employeesRes.status === 'fulfilled') {
          setEmployees(employeesRes.value)
        } else if (summaryRes.status === 'fulfilled') {
          setCoachingError(extractApiErrorMessage(employeesRes.reason, 'Failed to update coaching employees'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, selectedStoreId, appliedDateFrom, appliedDateTo, hasActiveDateFilter])

  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  const effectiveSubtitle = hasActiveDateFilter
    ? formatDateRange(appliedDateFrom, appliedDateTo)
    : subtitle

  return (
    <>
      <Header title="Coaching Effectiveness Tracker" subtitle={effectiveSubtitle}>
        <div className="flex items-center gap-2">
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

      <div className="px-[30px] py-[26px] flex flex-col gap-5">
        {coachingError && (
          <div className="bg-danger-light border border-[#EAB8B3] rounded-[11px] px-4 py-3 flex items-center justify-between gap-[10px]">
            <div className="flex items-center gap-2 text-[12.5px] text-danger leading-[1.5]">
              <span className="text-[15px] shrink-0">⚠️</span>
              <span>{coachingError}</span>
            </div>
          </div>
        )}
        <CoachingWinStrip summary={summary} isCustomRange={hasActiveDateFilter} />
        <CoachingTrackerPanel
          initialEmployees={employees}
          selectedStoreId={selectedStoreId}
          startDate={appliedDateFrom || undefined}
          endDate={appliedDateTo || undefined}
          view={hasActiveDateFilter ? 'custom' : 'month'}
        />
      </div>
    </>
  )
}
