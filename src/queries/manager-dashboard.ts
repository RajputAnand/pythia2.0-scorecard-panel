import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  ManagerDashboardEmployeeRow,
  ManagerDashboardSortBy,
  ManagerDashboardSummary,
  ManagerDashboardTrendWeek,
  ManagerDashboardView,
} from '@/types/manager-dashboard'
import {
  PREVIEW_MANAGER_DASHBOARD_SUMMARY,
  PREVIEW_EMPLOYEE_ROWS,
  PREVIEW_TREND_WEEKS,
} from '@/lib/kpi-preview-data'

interface SummaryResponse extends ManagerDashboardSummary {
  success: boolean
}

interface LeaderboardResponse {
  success: boolean
  count: number
  employees: ManagerDashboardEmployeeRow[]
}

interface TrendResponse {
  success: boolean
  weeks: ManagerDashboardTrendWeek[]
}

export interface FetchManagerDashboardSummaryParams {
  token: string
  view?: ManagerDashboardView
  storeId?: string
}

export async function fetchManagerDashboardSummary({
  token,
  view = 'week',
  storeId,
}: FetchManagerDashboardSummaryParams): Promise<ManagerDashboardSummary> {
  if (token.includes('mock')) {
    return PREVIEW_MANAGER_DASHBOARD_SUMMARY
  }
  try {
    const { data } = await pythia2Client.get<SummaryResponse>(PYTHIA_2_API.managerDashboard.summary, {
      headers: { Authorization: `Bearer ${token}` },
      params: { view, store_id: storeId || undefined },
    })
    return data
  } catch {
    return PREVIEW_MANAGER_DASHBOARD_SUMMARY
  }
}

export interface FetchManagerDashboardLeaderboardParams {
  token: string
  view?: ManagerDashboardView
  sortBy?: ManagerDashboardSortBy
  limit?: number
  storeId?: string
}

export async function fetchManagerDashboardLeaderboard({
  token,
  view = 'week',
  sortBy = 'thanked_count',
  limit,
  storeId,
}: FetchManagerDashboardLeaderboardParams): Promise<ManagerDashboardEmployeeRow[]> {
  if (token.includes('mock')) {
    return PREVIEW_EMPLOYEE_ROWS
  }
  try {
    const { data } = await pythia2Client.get<LeaderboardResponse>(PYTHIA_2_API.managerDashboard.leaderboard, {
      headers: { Authorization: `Bearer ${token}` },
      params: { view, sort_by: sortBy, limit: limit ?? undefined, store_id: storeId || undefined },
    })
    return data.employees
  } catch {
    return PREVIEW_EMPLOYEE_ROWS
  }
}

export interface FetchManagerDashboardTrendParams {
  token: string
  weeks?: number
  storeId?: string
}

export async function fetchManagerDashboardTrend({
  token,
  weeks = 8,
  storeId,
}: FetchManagerDashboardTrendParams): Promise<ManagerDashboardTrendWeek[]> {
  if (token.includes('mock')) {
    return PREVIEW_TREND_WEEKS
  }
  try {
    const { data } = await pythia2Client.get<TrendResponse>(PYTHIA_2_API.managerDashboard.trend, {
      headers: { Authorization: `Bearer ${token}` },
      params: { weeks, store_id: storeId || undefined },
    })
    return data.weeks
  } catch {
    return PREVIEW_TREND_WEEKS
  }
}
