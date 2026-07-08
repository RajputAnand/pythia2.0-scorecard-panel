import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2 } from '@/types/api'
import type { CoachingMoment, CoachingMomentsResponse, ProgressOverTimeData, TeamRankingData, TodayShiftSummary, WeeklyStats } from '@/types/overview'

export async function fetchWeeklyStats(token: string): Promise<WeeklyStats> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<WeeklyStats>>(
    PYTHIA_2_API.dashboard.weekly,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

export async function fetchTodayShiftSummary(token: string): Promise<TodayShiftSummary> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<TodayShiftSummary>>(
    PYTHIA_2_API.dashboard.today,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

export async function fetchTeamRanking(token: string): Promise<TeamRankingData> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<TeamRankingData>>(
    PYTHIA_2_API.dashboard.leaderboard,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  console.log(response.data, "response.data")
  return response.data
}

export async function fetchProgressOverTime(token: string): Promise<ProgressOverTimeData> {
  // Not wrapped in ApiResponseV2's `data` field — points_change_total/weeks are top-level siblings of `success`.
  const { data: response } = await pythia2Client.get<{ success: boolean } & ProgressOverTimeData>(
    PYTHIA_2_API.dashboard.progress,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response
}

export async function fetchCoachingMoments(token: string): Promise<CoachingMoment[]> {
  const { data: response } = await pythia2Client.post<CoachingMomentsResponse>(
    PYTHIA_2_API.coaching.moments,
    undefined,
    { headers: { Authorization: `Bearer ${token}` }, params: { use_cached: true } },
  )
  return response.coaching_tips
}
