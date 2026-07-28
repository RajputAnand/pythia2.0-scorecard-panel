import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type {
  ManagerDashboardEmployeeRow,
  ManagerDashboardSortBy,
  ManagerDashboardSummary,
  ManagerDashboardTrendWeek,
  ManagerDashboardView,
} from '@/types/manager-dashboard'

// Raw response shapes from app/routers/manager_dashboard.py — not the
// ApiResponseV2<T> envelope (no top-level `message`/`data`).
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
}

export async function fetchManagerDashboardSummary({
  token,
  view = 'week',
}: FetchManagerDashboardSummaryParams): Promise<ManagerDashboardSummary> {
  const { data } = await pythia2Client.get<SummaryResponse>(PYTHIA_2_API.managerDashboard.summary, {
    headers: { Authorization: `Bearer ${token}` },
    params: { view },
  })
  return data
}

export interface FetchManagerDashboardLeaderboardParams {
  token: string
  view?: ManagerDashboardView
  sortBy?: ManagerDashboardSortBy
  limit?: number
}

export async function fetchManagerDashboardLeaderboard({
  token,
  view = 'week',
  sortBy = 'thanked_count',
  limit,
}: FetchManagerDashboardLeaderboardParams): Promise<ManagerDashboardEmployeeRow[]> {
  const { data } = await pythia2Client.get<LeaderboardResponse>(PYTHIA_2_API.managerDashboard.leaderboard, {
    headers: { Authorization: `Bearer ${token}` },
    params: { view, sort_by: sortBy, limit: limit ?? undefined },
  })
  return data.employees
}

export interface FetchManagerDashboardTrendParams {
  token: string
  weeks?: number
}

export async function fetchManagerDashboardTrend({
  token,
  weeks = 8,
}: FetchManagerDashboardTrendParams): Promise<ManagerDashboardTrendWeek[]> {
  const { data } = await pythia2Client.get<TrendResponse>(PYTHIA_2_API.managerDashboard.trend, {
    headers: { Authorization: `Bearer ${token}` },
    params: { weeks },
  })
  return data.weeks
}
