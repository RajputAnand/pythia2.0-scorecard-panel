'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Header from '@/components/shared/Header/Header'
import DatePicker from '@/components/shared/DatePicker/DatePicker'
import UnknownIdentitiesAlertCard from '@/components/UnknownIdentitiesAlertCard/UnknownIdentitiesAlertCard'
import EmployeeSpotlightCard from '@/components/EmployeeSpotlightCard/EmployeeSpotlightCard'
import ManagerDashboardKpiStrip from '@/components/ManagerDashboardKpiStrip/ManagerDashboardKpiStrip'
import ManagerDashboardLeaderboard from '@/components/ManagerDashboardLeaderboard/ManagerDashboardLeaderboard'
import DemographicShifts from '@/components/DemographicShifts/DemographicShifts'
import CustomerSegmentShifts from '@/components/CustomerSegmentShifts/CustomerSegmentShifts'
import CoachingHealthSnapshot from '@/components/CoachingHealthSnapshot/CoachingHealthSnapshot'
import ManagerDashboardTrendChart from '@/components/ManagerDashboardTrendChart/ManagerDashboardTrendChart'
import { fetchManagerDashboardSummary } from '@/queries/manager-dashboard'
import { fetchCoachingSummary } from '@/queries/manager-coaching'
import { formatDateRange } from '@/utils/common'
import type { ManagerDashboardEmployeeRow, ManagerDashboardSummary, ManagerDashboardTrendWeek } from '@/types/manager-dashboard'
import type { CoachingSummary } from '@/types/coaching-plan'
import type { AgeDistributionResponse, GenderDistributionResponse, CustomerSegmentsResponse } from '@/types/demographics'

interface ManagerDashboardContentProps {
  initialSummary: ManagerDashboardSummary | null
  initialEmployees: ManagerDashboardEmployeeRow[]
  initialTrendWeeks: ManagerDashboardTrendWeek[] | null
  initialUnknownIdentitiesCount: number | null
  initialCoachingSummary: CoachingSummary | null
  initialAgeData: AgeDistributionResponse | null
  initialGenderData: GenderDistributionResponse | null
  initialCustomerSegmentsData: CustomerSegmentsResponse | null
  selectedStoreId?: string
  subtitle?: string
}

export default function ManagerDashboardContent({
  initialSummary,
  initialEmployees,
  initialTrendWeeks,
  initialUnknownIdentitiesCount,
  initialCoachingSummary,
  initialAgeData,
  initialGenderData,
  initialCustomerSegmentsData,
  selectedStoreId,
  subtitle,
}: ManagerDashboardContentProps) {
  const { data: session } = useSession()
  const token = session?.user?.pythia2Token

  const [summary, setSummary] = useState<ManagerDashboardSummary | null>(initialSummary)
  const [employees, setEmployees] = useState<ManagerDashboardEmployeeRow[]>(initialEmployees)
  const [coachingSummary, setCoachingSummary] = useState<CoachingSummary | null>(initialCoachingSummary)
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
    setCoachingSummary(initialCoachingSummary)
  }, [initialCoachingSummary])

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
      fetchManagerDashboardSummary({
        token,
        view: hasActiveDateFilter ? 'custom' : 'all',
        storeId: selectedStoreId,
        startDate: appliedDateFrom || undefined,
        endDate: appliedDateTo || undefined,
      }),
      fetchCoachingSummary({
        token,
        view: hasActiveDateFilter ? 'custom' : 'month',
        storeId: selectedStoreId,
        startDate: appliedDateFrom || undefined,
        endDate: appliedDateTo || undefined,
      }),
    ])
      .then(([summaryRes, coachingRes]) => {
        if (cancelled) return
        if (summaryRes.status === 'fulfilled') {
          setSummary(summaryRes.value)
        }
        if (coachingRes.status === 'fulfilled') {
          setCoachingSummary(coachingRes.value)
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
      <Header title="Manager Dashboard" subtitle={effectiveSubtitle}>
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
        <UnknownIdentitiesAlertCard count={initialUnknownIdentitiesCount} />
        <EmployeeSpotlightCard topEmployee={employees[0] ?? null} view="all" isCustomRange={hasActiveDateFilter} />
        <ManagerDashboardKpiStrip summary={summary} />
        <ManagerDashboardLeaderboard
          initialEmployees={employees}
          initialView="all"
          startDate={appliedDateFrom || undefined}
          endDate={appliedDateTo || undefined}
          onEmployeesUpdate={setEmployees}
        />
        <div className="grid grid-cols-[1fr_1fr] gap-[18px] items-start">
          <DemographicShifts ageData={initialAgeData} genderData={initialGenderData} />
          <CustomerSegmentShifts customerSegmentsData={initialCustomerSegmentsData} />
        </div>
        <div className="grid grid-cols-2 gap-5 items-start">
          <CoachingHealthSnapshot summary={coachingSummary} />
          <ManagerDashboardTrendChart weeks={initialTrendWeeks} />
        </div>
      </div>
    </>
  )
}
