'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import styles from './SuperAdminEmployeeOverviewContent.module.css'
import Header from '@/components/shared/Header/Header'
import EmployeeSelector from '@/components/shared/EmployeeSelector/EmployeeSelector'
import WeekNavButtons from '@/components/shared/WeekNavButtons/WeekNavButtons'
import DatePicker from '@/components/shared/DatePicker/DatePicker'
import HeroBanner from '@/components/HeroBanner/HeroBanner'
import ShiftSummary from '@/components/ShiftSummary/ShiftSummary'
import CoachingMoments from '@/components/CoachingMoments/CoachingMoments'
import Leaderboard from '@/components/Leaderboard/Leaderboard'
import ProgressChart from '@/components/ProgressChart/ProgressChart'
import SwagStore from '@/components/SwagStore/SwagStore'
import KpiVisibilityGate from '@/components/shared/KpiVisibilityGate/KpiVisibilityGate'
import { KPI_IDS } from '@/lib/admin-config-data'
import { PREVIEW_HERO_BANNER_DATA } from '@/lib/kpi-preview-data'
import { fetchEmployees } from '@/queries/employees'
import { fetchCoachingMoments, fetchDashboardSummary, fetchShiftHighlights } from '@/queries/scorecard'
import { extractApiErrorMessage, formatDateRange, formatWeekRange, getEmployeeName, getWeekSubtitle } from '@/utils/common'
import type { ApiEmployee } from '@/types/employee'
import type { CoachingMoment, DashboardSummaryResponse, OverviewPageData } from '@/types/overview'
import type { ShiftHighlight } from '@/types/shift'

interface SuperAdminEmployeeOverviewContentProps {
  initialEmployees: ApiEmployee[]
  initialSelectedEmployee: ApiEmployee | null
  initialSummary: DashboardSummaryResponse | null
  initialCoachingMoments: CoachingMoment[]
  initialCoachingGenerationInProgress: boolean
  initialShiftHighlights: ShiftHighlight[]
  initialShiftHighlightsGenerating: boolean
  overview: OverviewPageData | null
  token: string
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-5 animate-pulse">
      <div className="h-40 w-full rounded-xl bg-border" />
      <div className="h-72 w-full rounded-xl bg-border" />
      <div className="grid grid-cols-2 items-start gap-[18px]">
        <div className="h-72 rounded-xl bg-border" />
        <div className="h-72 rounded-xl bg-border" />
      </div>
      <div className="h-72 w-full rounded-xl bg-border" />
    </div>
  )
}

function OverviewEmpty({ message }: { message?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">📋</span>
      <p className="font-semibold text-[14px]">{message ? 'Dashboard unavailable' : 'No dashboard data yet'}</p>
      <p className="text-[12px] text-muted">
        {message ?? 'Scorecard data will appear once the employee logs their first shift.'}
      </p>
    </div>
  )
}

function NoEmployeesState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">👥</span>
      <p className="font-semibold text-[14px]">No employees found</p>
      <p className="text-[12px] text-muted">
        Create employees in the Manager view or onboard a tenant to view live performance scorecards.
      </p>
    </div>
  )
}

function SelectEmployeePrompt() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16">
      <span className="text-[32px]">👆</span>
      <p className="font-semibold text-[14px]">Select an employee</p>
      <p className="text-[12px] text-muted">
        Use the employee dropdown in the header to view an employee&apos;s live scorecard and performance metrics.
      </p>
    </div>
  )
}

export default function SuperAdminEmployeeOverviewContent({
  initialEmployees,
  initialSelectedEmployee,
  initialSummary,
  initialCoachingMoments,
  initialCoachingGenerationInProgress,
  initialShiftHighlights,
  initialShiftHighlightsGenerating,
  overview,
  token,
}: SuperAdminEmployeeOverviewContentProps) {
  const { data: session } = useSession()
  const activeToken = token || session?.user?.pythia2Token || ''

  const [employees, setEmployees] = useState<ApiEmployee[]>(initialEmployees)
  const [employeesLoading, setEmployeesLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<ApiEmployee | null>(initialSelectedEmployee)

  const [weekOffset, setWeekOffset] = useState(0)
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(initialSummary)
  const [coachingMoments, setCoachingMoments] = useState<CoachingMoment[]>(initialCoachingMoments)
  const [coachingGenerationInProgress, setCoachingGenerationInProgress] = useState(initialCoachingGenerationInProgress)
  const [shiftHighlights, setShiftHighlights] = useState<ShiftHighlight[]>(initialShiftHighlights)
  const [shiftHighlightsGenerating, setShiftHighlightsGenerating] = useState(initialShiftHighlightsGenerating)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const hasActiveDateFilter = Boolean(dateFrom && dateTo)
  const appliedDateFrom = hasActiveDateFilter ? dateFrom : ''
  const appliedDateTo = hasActiveDateFilter ? dateTo : ''

  const isFirstMount = useRef(true)

  // Fetch employees client-side if initial list was empty
  useEffect(() => {
    if (employees.length === 0 && activeToken) {
      let cancelled = false
      queueMicrotask(() => {
        if (!cancelled) setEmployeesLoading(true)
      })
      fetchEmployees({ token: activeToken, skip: 0, limit: 100 })
        .then((res) => {
          if (cancelled) return
          const list = res.data ?? []
          setEmployees(list)
          if (!selectedEmployee && list.length > 0) {
            setSelectedEmployee(list[0])
          }
        })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) setEmployeesLoading(false)
        })
      return () => {
        cancelled = true
      }
    }
  }, [activeToken, employees.length, selectedEmployee])

  // Fetch live scorecard data when selectedEmployee, weekOffset, or activeToken changes
  useEffect(() => {
    // Skip on first mount only if page.tsx already seeded initial summary data and no custom date is active
    if (isFirstMount.current && !appliedDateFrom && !appliedDateTo) {
      isFirstMount.current = false
      if (initialSummary) {
        return
      }
    }
    isFirstMount.current = false

    if (!selectedEmployee || !activeToken) {
      queueMicrotask(() => {
        setSummary(null)
        setCoachingMoments([])
        setShiftHighlights([])
      })
      return
    }

    const controller = new AbortController()
    let cancelled = false

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
    })

    const empId = selectedEmployee.user_id || selectedEmployee._id

    Promise.allSettled([
      fetchDashboardSummary({
        token: activeToken,
        weekOffset,
        employeeId: empId,
        startDate: appliedDateFrom || undefined,
        endDate: appliedDateTo || undefined,
        signal: controller.signal,
      }),
      fetchCoachingMoments(activeToken, empId),
    ])
      .then(async ([summaryRes, coachingRes]) => {
        if (cancelled) return

        if (summaryRes.status === 'fulfilled') {
          const newSummary = summaryRes.value
          setSummary(newSummary)

          // Fetch highlights if shift data exists
          const shiftStart = newSummary?.today?.shift_start
          const shiftStatus = newSummary?.today?.data?.shift_status
          if (shiftStart && shiftStatus && shiftStatus !== 'no_data') {
            try {
              const hlRes = await fetchShiftHighlights({
                token: activeToken,
                shiftStart,
                shiftStatus,
                employeeId: empId,
                signal: controller.signal,
              })
              if (!cancelled) {
                setShiftHighlights(hlRes.items)
                setShiftHighlightsGenerating(hlRes.generationInProgress)
              }
            } catch {
              if (!cancelled) {
                setShiftHighlights([])
                setShiftHighlightsGenerating(false)
              }
            }
          } else {
            setShiftHighlights([])
            setShiftHighlightsGenerating(false)
          }
        } else {
          setSummary(null)
          setError(extractApiErrorMessage(summaryRes.reason, 'Unable to load employee dashboard data.'))
        }

        if (coachingRes.status === 'fulfilled') {
          setCoachingMoments(coachingRes.value.items)
          setCoachingGenerationInProgress(coachingRes.value.generationInProgress)
        }
      })
      .catch((err) => {
        if (!cancelled && !axios.isCancel(err)) {
          setSummary(null)
          setError(extractApiErrorMessage(err, 'Unable to load employee dashboard data.'))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [selectedEmployee, weekOffset, activeToken, appliedDateFrom, appliedDateTo])

  const clearDateFilter = () => {
    setDateFrom('')
    setDateTo('')
  }

  const weekLabel = hasActiveDateFilter
    ? formatDateRange(appliedDateFrom, appliedDateTo)
    : summary
      ? formatWeekRange(summary.weekly.week_start, summary.weekly.week_end)
      : (() => {
          const refDate = new Date()
          refDate.setDate(refDate.getDate() - 7 * weekOffset)
          return getWeekSubtitle(refDate)
        })()

  // Ensure the selected employee's row is highlighted on the leaderboard
  const rawLeaderboardData = summary?.leaderboard?.data
  const leaderboardData = useMemo(() => {
    if (!rawLeaderboardData) return null
    const members = rawLeaderboardData.members
    const hasYou = members.some((m) => m.is_you)
    if (hasYou || !selectedEmployee) return rawLeaderboardData

    const empName = getEmployeeName(selectedEmployee).toLowerCase()
    const firstName = selectedEmployee.first_name?.toLowerCase()

    const updatedMembers = members.map((m) => {
      const match =
        m.label.toLowerCase() === empName ||
        (firstName && m.label.toLowerCase().includes(firstName))
      return match ? { ...m, is_you: true } : m
    })

    return {
      ...rawLeaderboardData,
      members: updatedMembers,
    }
  }, [rawLeaderboardData, selectedEmployee])


  return (
    <>
      <Header
        title="Employee Overview"
        subtitle={weekLabel}
      >
        <div className="flex items-center gap-2">
          <EmployeeSelector
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={(emp) => {
              setSelectedEmployee(emp)
            }}
            loading={employeesLoading}
          />
          {!hasActiveDateFilter && (
            <WeekNavButtons
              weekOffset={weekOffset}
              loading={loading}
              onPrevious={() => setWeekOffset((n) => Math.min(1, n + 1))}
              onNext={() => setWeekOffset((n) => Math.max(0, n - 1))}
            />
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

      <div className={styles.container}>
        {employeesLoading && employees.length === 0 ? (
          <OverviewSkeleton />
        ) : employees.length === 0 ? (
          <NoEmployeesState />
        ) : !selectedEmployee ? (
          <SelectEmployeePrompt />
        ) : loading ? (
          <OverviewSkeleton />
        ) : !summary ? (
          <OverviewEmpty message={error} />
        ) : (
          <div className="grid gap-5">
            <HeroBanner
              data={overview?.heroBanner ?? PREVIEW_HERO_BANNER_DATA}
              weeklyStats={summary.weekly.data}
              employeeName={getEmployeeName(selectedEmployee)}
              isCustomRange={hasActiveDateFilter}
            />

            <ShiftSummary
              shiftSummary={summary.today.data}
              highlights={shiftHighlights}
              highlightsGenerating={shiftHighlightsGenerating}
            />

            <div className="grid grid-cols-2 items-start gap-[18px]">
              <CoachingMoments
                items={coachingMoments}
                generationInProgress={coachingGenerationInProgress}
              />
              {leaderboardData && <Leaderboard data={leaderboardData} />}
            </div>

            {summary.progress.weeks.length > 0 ? (
              <ProgressChart data={summary.progress} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface py-10">
                <span className="text-[28px]">📈</span>
                <p className="text-[12.5px] font-semibold">No progress data yet</p>
              </div>
            )}

            <KpiVisibilityGate id={KPI_IDS.employeeSwagStore}>
              <SwagStore previewMode />
            </KpiVisibilityGate>
          </div>
        )}
      </div>
    </>
  )
}
